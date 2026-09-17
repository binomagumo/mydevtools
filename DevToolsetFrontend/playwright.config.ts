import { defineConfig, devices } from "@playwright/test";

const webServers = [
  {
    command: "node scripts/prepare-standalone.mjs && node .next/standalone/server.js",
    url: "http://127.0.0.1:3000/healthz",
    reuseExistingServer: false,
    gracefulShutdown: { signal: "SIGTERM" as const, timeout: 1_000 },
    timeout: 120_000,
  },
  {
    command:
      "dotnet ../DevToolsetBackend/bin/Release/net10.0/DevToolsetBackend.dll --urls http://127.0.0.1:5183",
    url: "http://127.0.0.1:5183/api/health",
    reuseExistingServer: false,
    gracefulShutdown: { signal: "SIGTERM" as const, timeout: 1_000 },
    timeout: 120_000,
  },
];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    permissions: ["clipboard-read", "clipboard-write"],
  },
  webServer: process.env.E2E_MANAGED_SERVERS === "1" ? undefined : webServers,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
