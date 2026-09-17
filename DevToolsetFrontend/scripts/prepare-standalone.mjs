import { cp } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneRoot = resolve(projectRoot, ".next", "standalone");

await cp(
  resolve(projectRoot, ".next", "static"),
  resolve(standaloneRoot, ".next", "static"),
  { recursive: true, force: true },
);

await cp(resolve(projectRoot, "public"), resolve(standaloneRoot, "public"), {
  recursive: true,
  force: true,
});
