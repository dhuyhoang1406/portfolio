import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const base = (process.env.BASE_URL || "http://localhost:5173").replace(
  /\/$/,
  "",
);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`${base}/?mode=2d`);
await expect(page.getByText("3.66", { exact: true })).toBeVisible();
await page.getByRole("button", { name: "Open Music", exact: true }).click();
const music = page.getByRole("region", {
  name: "Music",
  exact: true,
  includeHidden: true,
});
await expect(
  music.getByRole("heading", { name: "Window light" }),
).toBeVisible();
await expect
  .poll(() => music.locator("audio").evaluate((a) => a.readyState))
  .toBeGreaterThan(0);
expect(await music.locator("audio").evaluate((a) => a.paused)).toBe(true);
await music.getByRole("button", { name: "Play music", exact: true }).click();
await expect
  .poll(() => music.locator("audio").evaluate((a) => a.currentTime))
  .toBeGreaterThan(0);
await page.getByRole("button", { name: "Minimize Music", exact: true }).click();
expect(await music.locator("audio").evaluate((a) => a.paused)).toBe(false);
await page.getByRole("button", { name: "Restore Music", exact: true }).click();
await music.getByRole("button", { name: "Pause music", exact: true }).click();
await music.getByRole("button", { name: "Next track", exact: true }).click();
await expect(music.getByRole("heading", { name: "After hours" })).toBeVisible();
await music
  .getByLabel("Choose local music")
  .setInputFiles("public/music/window-light.wav");
await expect(
  music.getByRole("heading", { name: "window-light" }),
).toBeVisible();
await music.locator("audio").evaluate((element) => {
  window.__closedAudio = element;
});
await page.getByRole("button", { name: "Close Music", exact: true }).click();
expect(await page.evaluate(() => window.__closedAudio.paused)).toBe(true);
await expect(page.locator("audio")).toHaveCount(0);
await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
const game = page.getByRole("region", { name: "Arcade", exact: true });
const cards = game.locator(".memory-grid button");
expect(await cards.count()).toBe(12);
await cards.nth(0).click();
await expect(cards.nth(0)).toHaveAttribute("aria-pressed", "true");
await cards.nth(1).click();
await expect(game.locator(".game-score")).toContainText("01");
await game.getByRole("button", { name: "New game" }).click();
await expect(game.locator(".game-score")).toContainText("00");
await page.screenshot({ path: "/tmp/workspace-arcade.png" });
await page.getByRole("button", { name: "Open Projects", exact: true }).click();
await expect(
  page.getByRole("region", { name: "Projects", exact: true }),
).toContainText("My contributions");
await page.screenshot({ path: "/tmp/workspace-projects.png" });
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${base}/?mode=2d`);
await mobile.getByRole("button", { name: "Open Music", exact: true }).click();
await expect(
  mobile.getByRole("button", { name: "Play music", exact: true }),
).toBeVisible();
await mobile.screenshot({ path: "/tmp/workspace-mobile.png" });
expect(errors).toEqual([]);
await browser.close();
console.log(
  "PASS: richer profile, music manual playback, minimize continuity, pause, track switching, local audio, close cleanup, memory game and reset, case studies and mobile controls.",
);
