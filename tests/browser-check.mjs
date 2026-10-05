import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  headless: true,
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const base = (process.env.BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => errors.push(e.message));
await page.addInitScript(() => {
  window.__clickSounds = 0;
  const original = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    window.__clickSounds++;
    window.__lastClickAudio = this;
    return original.apply(this, args);
  };
});
await page.goto(`${base}/`);
await expect(page.locator("canvas")).toBeVisible();
await page.waitForTimeout(2500);
await expect(page.getByRole("button", { name: "Enter computer" })).toBeEnabled({
  timeout: 30000,
});
await page.screenshot({ path: "/tmp/hoang-room.png" });
// Drag rotates the room without entering; click a room wall, not the monitor.
expect(await page.evaluate(() => window.__clickSounds)).toBe(0);
const originalScreen = await page.locator(".embedded").boundingBox();
await page.mouse.move(900, 700);
await page.mouse.down();
await page.mouse.move(960, 700, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(600);
await expect(page.getByRole("button", { name: "Back to room" })).toHaveCount(0);
const rotatedScreen = await page.locator(".embedded").boundingBox();
expect(Math.abs(rotatedScreen.x - originalScreen.x)).toBeGreaterThan(3);
await expect(page.getByRole("button", { name: /Skip 3D/ })).toHaveCount(0);
const enterStarted = Date.now();
await page.mouse.click(400, 300);
await expect(page.getByRole("button", { name: "Back to room" })).toBeDisabled();
await page.waitForTimeout(800);
await page.screenshot({ path: "/tmp/hoang-entry-motion.png" });
await expect(page.getByRole("button", { name: "Back to room" })).toBeEnabled({
  timeout: 10000,
});
expect(Date.now() - enterStarted).toBeGreaterThanOrEqual(2200);
await page.screenshot({ path: "/tmp/hoang-screen.png" });
await page.getByRole("button", { name: "Customize desktop theme" }).click();
await page.getByRole("button", { name: "Use Midnight theme" }).click();
await expect(page.locator(".desktop")).toHaveAttribute(
  "data-theme",
  "midnight",
);
await page.keyboard.press("Escape");
await expect(page.getByRole("button", { name: "Back to room" })).toBeEnabled();
await expect(
  page.getByRole("dialog", { name: "Desktop appearance" }),
).toHaveCount(0);
await page
  .getByRole("button", { name: "Maximize About Me", exact: true })
  .click();
await expect(
  page.getByRole("region", { name: "About Me", exact: true }),
).toHaveClass(/window-maximized/);
await page.getByRole("button", { name: "Restore size of About Me" }).click();
await page.getByRole("button", { name: "Customize desktop theme" }).click();
await page.getByRole("button", { name: "Use Paper theme" }).click();
await page.getByRole("button", { name: "Close appearance" }).click();

await page.getByRole("button", { name: "Open Projects" }).click();
expect(await page.evaluate(() => window.__clickSounds)).toBeGreaterThan(0);
await expect
  .poll(() => page.evaluate(() => window.__lastClickAudio?.readyState ?? 0))
  .toBeGreaterThanOrEqual(2);
expect(await page.evaluate(() => window.__lastClickAudio.error)).toBeNull();
expect(
  await page.evaluate(() => window.__lastClickAudio.duration),
).toBeGreaterThan(0);
await expect(
  page.getByRole("heading", { name: "Things I've built" }),
).toBeVisible();
const win = page.getByRole("region", { name: "Projects", exact: true });
const scrollThumb = win.locator(".window-scrollbar-thumb");
const scrollbar = win.getByRole("scrollbar", { name: "Scroll Projects" });
const thumbBox = await scrollThumb.boundingBox();
await page.mouse.move(
  thumbBox.x + thumbBox.width / 2,
  thumbBox.y + thumbBox.height / 2,
);
await page.mouse.down();
await page.mouse.move(
  thumbBox.x + thumbBox.width / 2,
  thumbBox.y + thumbBox.height / 2 + 90,
  { steps: 12 },
);
await page.mouse.up();
expect(
  await win.locator(".window-content").evaluate((el) => el.scrollTop),
).toBeGreaterThan(100);
await scrollbar.focus();
await page.keyboard.press("Home");
expect(
  await win.locator(".window-content").evaluate((el) => el.scrollTop),
).toBe(0);

const title = win.locator(".titlebar");
const before = await title.boundingBox();
await page.mouse.move(before.x + 80, before.y + 15);
await page.mouse.down();
await page.mouse.move(before.x + 140, before.y + 45, { steps: 10 });
await page.mouse.up();
const after = await title.boundingBox();
expect(after.x).toBeGreaterThan(before.x + 20);
await win.locator(".window-content").evaluate((el) => {
  el.scrollTop = 120;
});
await page
  .getByRole("button", { name: "Minimize Projects", exact: true })
  .click();
await expect(win).toHaveCount(0);
await page.getByRole("button", { name: "Restore Projects" }).click();
await expect(win).toBeVisible();
expect(
  await win.locator(".window-content").evaluate((el) => el.scrollTop),
).toBe(120);
await page.getByRole("button", { name: "Open Projects" }).click();
await expect(win).toHaveCount(1);
await title.focus();
await page.keyboard.press("ArrowLeft");
await page.setViewportSize({ width: 1024, height: 768 });
await expect(page.getByRole("button", { name: "Back to room" })).toBeEnabled({
  timeout: 10000,
});
await expect(
  page.getByRole("button", { name: "Close Projects" }),
).toBeVisible();
await page.getByRole("button", { name: "Close Projects" }).click();
await expect(win).toHaveCount(0);
const exitStarted = Date.now();
await page.getByRole("button", { name: "Back to room" }).click();
await expect(
  page.getByRole("button", { name: "Moving camera" }),
).toBeDisabled();
await page.waitForTimeout(800);
await page.screenshot({ path: "/tmp/hoang-exit-motion.png" });
await expect(page.getByRole("button", { name: "Enter computer" })).toBeEnabled({
  timeout: 10000,
});
expect(Date.now() - exitStarted).toBeGreaterThanOrEqual(2200);
await page.goto(`${base}/?mode=2d`);
await page.getByRole("button", { name: "Open Contact" }).click();
await expect(
  page.getByRole("link", { name: /dhuyhoang1406@gmail/ }),
).toBeVisible();
await page.screenshot({ path: "/tmp/hoang-2d.png" });
await page.getByRole("button", { name: "Open Skills" }).click();
await expect(page.getByText("TypeScript", { exact: true })).toBeVisible();
await page.getByRole("button", { name: "Close Skills" }).click();
await page.getByRole("button", { name: "Open Resume" }).click();
await expect(
  page.getByRole("link", { name: "Download resume" }),
).toHaveAttribute("href", new URL(`${base}/documents/resume.pdf`).pathname);
const pdf = await page.request.get(`${base}/documents/resume.pdf`);
expect(pdf.status()).toBe(200);
expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");

await page.getByRole("button", { name: "Open application launcher" }).click();
await page.getByRole("button", { name: "Launch Projects" }).click();
await expect(
  page.getByRole("region", { name: "Projects", exact: true }),
).toHaveCount(1);
await page
  .getByRole("button", { name: "Minimize Projects from taskbar" })
  .click();
await expect(
  page.getByRole("region", { name: "Projects", exact: true }),
).toHaveCount(0);
await page
  .getByRole("button", { name: "Restore Projects", exact: true })
  .click();
await page.getByRole("button", { name: "Customize desktop theme" }).click();
await page.getByRole("button", { name: "Use Dusk theme" }).click();
await page.getByLabel("Accent color").fill("#d7b3ff");
await expect(page.locator(".desktop")).toHaveAttribute(
  "style",
  /--desktop-accent: #d7b3ff/,
);
await page.getByRole("button", { name: "Close appearance" }).click();
await page.screenshot({ path: "/tmp/hoang-dusk.png" });
await page.reload();
await expect(page.locator(".desktop")).toHaveAttribute("data-theme", "dusk");
await expect(page.locator(".desktop")).toHaveAttribute(
  "style",
  /--desktop-accent: #d7b3ff/,
);
await page.getByRole("button", { name: "Customize desktop theme" }).click();
await page.getByRole("button", { name: "Use Midnight theme" }).click();
await page.screenshot({ path: "/tmp/hoang-midnight.png" });
await page.getByRole("button", { name: "Use Paper theme" }).click();
await page.getByRole("button", { name: "Close appearance" }).click();
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const requests = [];
mobile.on("request", (r) => requests.push(r.url()));
await mobile.goto(`${base}/`);
await mobile.getByRole("button", { name: "Open Projects" }).click();
await expect(
  mobile.getByRole("heading", { name: "Things I've built" }),
).toBeVisible();
expect(requests.some((u) => u.endsWith(".glb"))).toBe(false);
await mobile.screenshot({ path: "/tmp/hoang-mobile.png" });
await mobile.getByRole("button", { name: "Customize desktop theme" }).click();
await mobile.getByRole("button", { name: "Use Midnight theme" }).click();
await mobile.getByRole("button", { name: "Close appearance" }).click();
await expect(
  mobile.getByRole("button", { name: "Close Projects", exact: true }),
).toBeVisible();
await mobile.screenshot({ path: "/tmp/hoang-mobile-midnight.png" });

const fail = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await fail.route("**/low_poly_room.glb", (route) => route.abort());
await fail.goto(`${base}/`);
await expect(
  fail.getByText("The 3D room is unavailable.", { exact: false }),
).toBeVisible();
await expect(fail.getByRole("heading", { name: /Dang Huy/ })).toBeVisible();
const noGl = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const noGlRequests = [];
noGl.on("request", (r) => noGlRequests.push(r.url()));
await noGl.addInitScript(() => {
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (type === "webgl" || type === "webgl2") return null;
    return get.call(this, type, ...args);
  };
});
await noGl.goto(`${base}/`);
await expect(noGl.getByRole("heading", { name: /Dang Huy/ })).toBeVisible();
expect(noGlRequests.some((u) => u.endsWith(".glb"))).toBe(false);
const reduced = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
await reduced.goto(`${base}/`);
await expect(reduced.locator("canvas")).toBeVisible();
await expect(
  reduced.getByRole("button", { name: "Enter computer" }),
).toBeEnabled({ timeout: 30000 });
await reduced.getByRole("button", { name: "Enter computer" }).click();
await expect(
  reduced.getByRole("button", { name: "Back to room" }),
).toBeEnabled();
await reduced.keyboard.press("Escape");
await expect(
  reduced.getByRole("button", { name: "Enter computer" }),
).toBeEnabled();
const loading = await browser.newPage({
  viewport: { width: 1280, height: 900 },
});
let releaseLoad;
const loadGate = new Promise((resolve) => {
  releaseLoad = resolve;
});
await loading.route("**/low_poly_room.glb", async (route) => {
  await loadGate;
  await route.continue();
});
await loading.goto(`${base}/`);
const boot = loading.getByRole("status", { name: "Loading workspace" });
await expect(boot).toBeVisible();
await expect(boot).toHaveCSS("background-color", "rgb(5, 5, 5)");
await loading.screenshot({ path: "/tmp/hoang-terminal-loading.png" });
releaseLoad();
await expect(boot).toHaveCount(0, { timeout: 30000 });
expect(errors).toEqual([]);
console.log(
  "PASS: room-wall click, orbit drag, 2.4s entry/exit motion, audio playback request, no autoplay, camera, apps, scaled drag, minimize/restore, no duplicates, close, room return, 2D, Skills, real resume PDF, mobile no GLB, model-error fallback, keyboard, resize, reduced motion, missing WebGL, launcher, taskbar toggle, maximize/restore, three themes, custom accent persistence, mobile appearance, scrollbar drag inside 3D, scrollbar keyboard, terminal loading; no page errors.",
);
await browser.close();
