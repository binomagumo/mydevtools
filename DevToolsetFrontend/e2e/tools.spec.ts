import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("developer tools", () => {
  test("formats JSON and supports the keyboard shortcut", async ({ page }) => {
    await page.goto("/tools/json/formatter");
    await page.getByLabel("JSON input").fill('{"hello":"world"}');
    await page.getByRole("button", { name: "Format" }).click();

    await expect(page.locator("pre")).toContainText('"hello": "world"');

    await page.getByLabel("JSON input").fill('{"shortcut":true}');
    await page.getByLabel("JSON input").press("Control+Enter");
    await expect(page.locator("pre")).toContainText('"shortcut": true');
  });

  test("validates invalid JSON with an announced error", async ({ page }) => {
    await page.goto("/tools/json/validator");
    await page.getByLabel("JSON input").fill('{"broken":');
    await page.getByRole("button", { name: "Validate" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "Invalid JSON" }),
    ).toBeVisible();
  });

  test("minifies JSON and validates empty input", async ({ page }) => {
    await page.goto("/tools/json/minifier");
    await page.getByRole("button", { name: "Minify" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Enter JSON to minify" }),
    ).toBeVisible();

    await page.getByLabel("JSON input").fill('{ "hello": "world" }');
    await page.getByRole("button", { name: "Minify" }).click();
    await expect(page.locator("pre")).toHaveText('{"hello":"world"}');
  });

  test("runs the encoding tools and copies output", async ({ page }) => {
    await page.goto("/tools/encoding/base64");
    await page.getByLabel("Base64 input").fill("hello");
    await page.getByRole("button", { name: "Encode", exact: true }).last().click();
    await expect(page.locator("pre")).toHaveText("aGVsbG8=");

    await page.getByRole("button", { name: "Copy" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();

    await page.goto("/tools/encoding/url");
    await page.getByLabel("URL input").fill("hello world");
    await page.getByRole("button", { name: "Encode", exact: true }).last().click();
    await expect(page.locator("pre")).toHaveText("hello%20world");
  });

  test("runs security and generator tools", async ({ page }) => {
    await page.goto("/tools/security/hash");
    await page.getByLabel("Hash input").fill("hello");
    await page.getByRole("button", { name: "Generate Hash" }).click();
    await expect(page.locator("pre")).toHaveText(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );

    await page.goto("/tools/security/jwt");
    await page.getByLabel("JWT input").fill("eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIn0.");
    await page.getByRole("button", { name: "Decode" }).click();
    await expect(page.getByText("Header", { exact: true })).toBeVisible();
    await expect(page.getByText("Payload", { exact: true })).toBeVisible();

    await page.goto("/tools/generators/uuid");
    await page.getByRole("button", { name: "Generate" }).click();
    await expect(page.getByText(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )).toBeVisible();
  });

  test("searches tools and supports the mobile menu", async ({ page }) => {
    await page.goto("/tools/json/formatter");
    await page.getByRole("button", { name: /Search tools/ }).click();
    await page.getByRole("textbox", { name: "Search tools" }).fill("JWT");
    await expect(page.getByRole("button", { name: "JWT" })).toBeVisible();
    await page.getByRole("button", { name: "JWT" }).click();
    await expect(page).toHaveURL(/\/tools\/security\/jwt$/);

    if (test.info().project.name === "mobile-chromium") {
      await page.getByRole("button", { name: "Open tool menu" }).click();
      await expect(page.getByRole("dialog", { name: "Tool navigation" })).toBeVisible();
      await page.getByRole("link", { name: "Base64" }).click();
      await expect(page).toHaveURL(/\/tools\/encoding\/base64$/);
    }
  });

  test("restores focus when the search dialog closes", async ({ page }) => {
    await page.goto("/tools/json/formatter");
    const trigger = page.getByRole("button", { name: /Search tools/ }).first();
    await trigger.focus();
    await page.keyboard.press("Control+k");

    const dialog = page.getByRole("dialog", { name: "Search tools" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Search tools" })).toBeFocused();
    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("reflows without horizontal page scrolling at narrow width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/tools/json/formatter");

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows).toBe(false);
  });

  test("shows a recoverable API failure", async ({ page }) => {
    await page.route("**/api-proxy/api/json/format", (route) => route.abort());
    await page.goto("/tools/json/formatter");
    await page.getByLabel("JSON input").fill('{"hello":"world"}');
    await page.getByRole("button", { name: "Format" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: /API is unavailable/ }),
    ).toBeVisible();
  });

  test("has no automated accessibility violations on the formatter", async ({ page }) => {
    await page.goto("/tools/json/formatter");
    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
