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
const about = page.getByRole("region", { name: "About Me", exact: true });
const resizeHandle = about.getByRole("button", {
  name: "Resize About Me window with arrow keys",
});
const initialWidth = await about.evaluate((el) => el.clientWidth);
await resizeHandle.focus();
await page.keyboard.press("ArrowRight");
expect(await about.evaluate((el) => el.clientWidth)).toBeGreaterThan(
  initialWidth,
);
const handleRect = await resizeHandle.boundingBox();
const keyboardWidth = await about.evaluate((el) => el.clientWidth);
await page.mouse.move(handleRect.x + 8, handleRect.y + 8);
await page.mouse.down();
await page.mouse.move(handleRect.x + 35, handleRect.y + 8);
await page.mouse.up();
expect(await about.evaluate((el) => el.clientWidth)).toBeGreaterThan(
  keyboardWidth,
);
await page.getByRole("button", { name: "Open Music", exact: true }).click();
const music = page.getByRole("region", {
  name: "Music",
  exact: true,
  includeHidden: true,
});
await expect(music.getByRole("heading", { name: "Từng Quen" })).toBeVisible();
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
await expect(
  music.getByRole("heading", { name: "đưa em về nhàa" }),
).toBeVisible();
await music
  .getByLabel("Choose local music")
  .setInputFiles("public/music/tung-quen.mp3");
await expect(music.getByRole("heading", { name: "tung-quen" })).toBeVisible();
await music.locator("audio").evaluate((element) => {
  window.__closedAudio = element;
});
await page.getByRole("button", { name: "Close Music", exact: true }).click();
expect(await page.evaluate(() => window.__closedAudio.paused)).toBe(true);
await expect(page.locator("audio")).toHaveCount(0);
await page.getByRole("button", { name: "Open Arcade", exact: true }).click();
const game = page.getByRole("region", { name: "Arcade", exact: true });
await expect(game.locator("iframe")).toHaveCount(0);
await game.getByRole("button", { name: "Play Celeste Classic" }).click();
await expect(game.locator("iframe")).toHaveAttribute(
  "src",
  "https://itch.io/embed-upload/235259?color=303030",
);
await expect(
  game.frameLocator("iframe").frameLocator("iframe").locator("#canvas"),
).toBeVisible({
  timeout: 30000,
});
await game.getByRole("button", { name: "Fullscreen game ⛶" }).click();
await expect
  .poll(() => page.evaluate(() => document.fullscreenElement?.className))
  .toBe("external-game-viewport");
const fullscreenFrame = await game.locator("iframe").boundingBox();
const fullscreenSize = page.viewportSize();
expect(
  Math.abs(
    fullscreenFrame.x + fullscreenFrame.width / 2 - fullscreenSize.width / 2,
  ),
).toBeLessThan(2);
expect(
  Math.abs(
    fullscreenFrame.y + fullscreenFrame.height / 2 - fullscreenSize.height / 2,
  ),
).toBeLessThan(2);
expect(fullscreenFrame.width).toBeLessThanOrEqual(fullscreenSize.width + 1);
expect(fullscreenFrame.height).toBeLessThanOrEqual(fullscreenSize.height + 1);
await page.screenshot({ path: "/tmp/os-fullscreen-game.png" });
await page.getByRole("button", { name: "Exit game fullscreen" }).click();
await expect
  .poll(() => page.evaluate(() => document.fullscreenElement))
  .toBeNull();
await game.getByRole("button", { name: "Restart game" }).click();
await expect(
  game.frameLocator("iframe").frameLocator("iframe").locator("#canvas"),
).toBeVisible({
  timeout: 30000,
});
await game.getByRole("button", { name: "Stop game" }).click();
await expect(game.locator("iframe")).toHaveCount(0);
await page.getByRole("button", { name: "Open application launcher" }).click();
await page.getByRole("textbox", { name: "Search applications" }).fill("music");
await expect(
  page.getByRole("button", { name: "Launch Music", exact: true }),
).toBeVisible();
await expect(
  page.getByRole("button", { name: "Launch Projects", exact: true }),
).toHaveCount(0);
await page.getByRole("button", { name: "Launch Music", exact: true }).click();
await page.getByRole("button", { name: "Show desktop", exact: true }).click();
await expect(page.locator(".window:not([hidden])")).toHaveCount(0);
await page.getByRole("button", { name: "Restore Arcade", exact: true }).click();
await page.screenshot({ path: "/tmp/workspace-arcade.png" });
await page.getByRole("button", { name: "Open application launcher" }).click();
await page
  .getByRole("textbox", { name: "Search applications" })
  .fill("projects");
await page
  .getByRole("button", { name: "Launch Projects", exact: true })
  .click();
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
  "PASS: richer profile, music manual playback, minimize continuity, pause, track switching, local audio, close cleanup, external game lazy load, centered fullscreen/exit, restart/stop, Start search, Show desktop and keyboard/pointer window resize, case studies and mobile controls.",
);
