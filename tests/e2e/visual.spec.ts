import { expect, test } from "@playwright/test";
const MODES = ["normal", "raking-light", "uv", "infrared", "xray", "microscopic", "reconstruction"];
for (let i = 0; i < MODES.length; i++) {
  test(`visual: ${MODES[i]}`, async ({ page }) => {
    await page.goto(`/?gfx=off&skip=1&t=${i}`); await page.addStyleTag({ content: "*{animation:none!important;transition:none!important}" });
    await expect(page.getByTestId("hud")).toBeVisible(); await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot(`${MODES[i]}.png`, { maxDiffPixelRatio: 0.05 });
  });
}
