import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendDll = resolve(
  frontendRoot,
  "..",
  "DevToolsetBackend",
  "bin",
  "Release",
  "net10.0",
  "DevToolsetBackend.dll",
);
const standaloneRoot = resolve(frontendRoot, ".next", "standalone");
const playwrightCli = resolve(
  frontendRoot,
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);

const children = [];

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: frontendRoot,
    env: process.env,
    stdio: "inherit",
    ...options,
  });
  children.push(child);
  return child;
}

async function waitFor(url) {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // The service is still starting.
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function stop(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
  } else {
    child.kill("SIGTERM");
  }
}

let exitCode = 1;

try {
  await new Promise((resolvePromise, rejectPromise) => {
    const prepare = spawn(process.execPath, ["scripts/prepare-standalone.mjs"], {
      cwd: frontendRoot,
      env: process.env,
      stdio: "inherit",
    });
    prepare.once("error", rejectPromise);
    prepare.once("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`Standalone preparation failed with ${code}`));
      }
    });
  });

  start(process.execPath, [resolve(standaloneRoot, "server.js")], {
    cwd: standaloneRoot,
    env: { ...process.env, PORT: "3000", HOSTNAME: "127.0.0.1" },
  });
  start("dotnet", [backendDll, "--urls", "http://127.0.0.1:5183"], {
    env: {
      ...process.env,
      "Logging__LogLevel__Microsoft.AspNetCore": "Error",
    },
  });

  await Promise.all([
    waitFor("http://127.0.0.1:3000/healthz"),
    waitFor("http://127.0.0.1:5183/api/health"),
  ]);

  const test = start(process.execPath, [playwrightCli, "test", ...process.argv.slice(2)], {
    env: { ...process.env, E2E_MANAGED_SERVERS: "1" },
  });
  exitCode = await new Promise((resolvePromise) => {
    test.once("exit", (code, signal) => {
      resolvePromise(code ?? (signal ? 1 : 0));
    });
  });

} catch (error) {
  console.error(error);
} finally {
  for (const child of children.reverse()) {
    stop(child);
  }
}

process.exit(exitCode);
