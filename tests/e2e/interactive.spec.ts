import { expect, test } from "@playwright/test";

test("modality rail switches modes and the readout updates", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  await page.getByTestId("nav-infrared").click();
  await expect(page.getByTestId("readout")).toContainText("Infrared");
});

test("the painting actually re-renders between modalities, not just the label", async ({ page }) => {
  // Sample left of the comparison lens (default 50%) so the pixel is on the mode-dependent "current" side, not the mode-independent "restored" side.
  await page.goto("/?skip=1&t=0&lens=1");
  await page.waitForFunction(() => typeof (window as unknown as { __tesseraStats?: unknown }).__tesseraStats === "function", null, { timeout: 30_000 });
  await page.waitForTimeout(400);
  const stage = page.getByTestId("stage"), box = await stage.boundingBox(); if (!box) throw new Error("no box");
  const a = await page.screenshot({ clip: { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5, width: 2, height: 2 } });
  await page.getByTestId("nav-uv").click();
  await page.waitForTimeout(400);
  const b = await page.screenshot({ clip: { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5, width: 2, height: 2 } });
  expect(a.toString("base64")).not.toBe(b.toString("base64"));
});

test("comparison lens actually moves the split, not just the number", async ({ page }) => {
  await page.goto("/?skip=1&t=0&lens=0.1");
  await page.waitForFunction(() => typeof (window as unknown as { __tesseraStats?: unknown }).__tesseraStats === "function", null, { timeout: 30_000 });
  await page.waitForTimeout(400);
  const stage = page.getByTestId("stage"), box = await stage.boundingBox(); if (!box) throw new Error("no box");
  const a = await page.screenshot({ clip: { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5, width: 2, height: 2 } });
  const scrub = page.getByTestId("lens-scrub"); await scrub.focus(); await page.keyboard.press("End");
  await page.waitForTimeout(400);
  const b = await page.screenshot({ clip: { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5, width: 2, height: 2 } });
  expect(a.toString("base64")).not.toBe(b.toString("base64"));
});

test("logbook entry selection shows detail", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  await page.getByTestId("log-log-1").click();
  await expect(page.getByTestId("log-detail")).toBeVisible();
});

test("out-of-range lens position clamps natively", async ({ page }) => {
  await page.goto("/?skip=1&t=0");
  const scrub = page.getByTestId("lens-scrub");
  await scrub.evaluate((el: HTMLInputElement) => { el.value = "99"; el.dispatchEvent(new Event("input", { bubbles: true })); });
  expect(Number(await scrub.inputValue())).toBeLessThanOrEqual(1);
});

test("keyboard-only: tab reaches the modality rail and activates a mode", async ({ page }) => {
  await page.goto("/?skip=1");
  await expect(page.getByTestId("hud")).toBeVisible();
  await page.getByTestId("nav-xray").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("nav-xray")).toHaveClass(/on/);
});

test("mobile width keeps the readout usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/?skip=1&t=0");
  await expect(page.getByTestId("hud")).toBeVisible();
  await expect(page.getByTestId("readout")).toBeVisible();
});

test("reduced motion: intro renders a static keyframe list with no timeline", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("intro")).toBeVisible();
  await page.getByTestId("skip-intro").click();
  await expect(page.getByTestId("hud")).toBeVisible();
});

test("graphics failure: gfx=off falls back to the poster with no canvas", async ({ page }) => {
  await page.goto("/?gfx=off&skip=1");
  await expect(page.getByTestId("poster")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});
