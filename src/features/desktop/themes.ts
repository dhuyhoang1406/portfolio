export const themes = [
  {
    id: "paper",
    name: "Paper",
    description: "Soft light, clear ideas",
    accent: "#a9472f",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "A quiet space after hours",
    accent: "#9dc8ff",
  },
  {
    id: "dusk",
    name: "Dusk",
    description: "Warm tones, fresh perspective",
    accent: "#ffbe99",
  },
] as const;
export type ThemeId = (typeof themes)[number]["id"];
export type Appearance = { theme: ThemeId; accent: string };
export const appearanceKey = "hoang-workspace-appearance";
export function readAppearance(): Appearance {
  try {
    const data = JSON.parse(localStorage.getItem(appearanceKey) || "null");
    if (
      data &&
      themes.some((t) => t.id === data.theme) &&
      /^#[0-9a-f]{6}$/i.test(data.accent)
    )
      return data;
  } catch {
    /* Storage is optional. */
  }
  return { theme: "paper", accent: themes[0].accent };
}
