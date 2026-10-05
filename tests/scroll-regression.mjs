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
const base = process.env.BASE_URL || "http://localhost:5173";
const page = await browser.newPage({
  viewport: { width: 1860, height: 931 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
async function verify(label) {
  const win = page.getByRole("region", { name: label, exact: true });
  const content = win.locator(".window-content");
  const bar = win.getByRole("scrollbar");
  const thumb = win.locator(".window-scrollbar-thumb");
  const top = () => content.evaluate((el) => el.scrollTop);
  const range = await content.evaluate(
    (el) => el.scrollHeight - el.clientHeight,
  );
  if (range <= 0) {
    await expect(bar).toHaveAttribute("aria-disabled", "true");
    return;
  }
  await content.evaluate((el) => (el.scrollTop = 0));
  const body = await content.boundingBox();
  await page.mouse.move(body.x + 60, body.y + 80);
  await page.mouse.wheel(0, 24);
  await expect.poll(top).toBe(Math.min(24, range)); // No doubled native scrolling in 2D.
  await page.mouse.wheel(0, -range - 450);
  await expect.poll(top).toBe(0);
  let rect = await thumb.boundingBox();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.wheel(0, range + 450);
  await expect.poll(top).toBe(range);
  await page.mouse.wheel(0, -range - 450);
  await expect.poll(top).toBe(0);
  rect = await thumb.boundingBox();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width / 2,
    rect.y + rect.height / 2 + 100,
    { steps: 10 },
  );
  await page.mouse.up();
  await expect.poll(top).toBeGreaterThan(0);
  await bar.focus();
  await page.keyboard.press("Home");
  await expect.poll(top).toBe(0);
}
try {
  await page.goto(base);
  await expect(
    page.getByRole("button", { name: "Enter computer" }),
  ).toBeEnabled({ timeout: 30000 });
  await page.getByRole("button", { name: "Enter computer" }).click();
  await expect(
    page.getByRole("button", { name: "Back to room" }),
  ).toBeEnabled();
  for (const app of ["About Me", "Projects", "Skills", "Resume", "Contact"]) {
    await page
      .getByRole("button", { name: `Open ${app}`, exact: true })
      .click();
    await verify(app);
  }
  await page
    .getByRole("button", { name: "Open About Me", exact: true })
    .click();
  const content = page
    .getByRole("region", { name: "About Me", exact: true })
    .locator(".window-content");
  const rect = await content.boundingBox();
  await page.mouse.move(rect.x + 70, rect.y + 80);
  await page.mouse.wheel(0, 450);
  await expect
    .poll(() => content.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await page.screenshot({ path: "/tmp/hoang-about-scroll-fixed.png" });
  await page.goto(`${base}/?mode=2d`);
  for (const app of ["About Me", "Projects", "Resume"]) {
    await page
      .getByRole("button", { name: `Open ${app}`, exact: true })
      .click();
    await verify(app);
  }
  expect(errors).toEqual([]);
  console.log(
    "PASS: actual wheel over content and scrollbar, up/down, thumb drag and keyboard across portfolio apps in 3D and 2D at 1860×931; no doubled wheel movement or page errors.",
  );
} finally {
  await browser.close();
}
