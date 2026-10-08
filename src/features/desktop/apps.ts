export type AppId =
  | "About Me"
  | "Projects"
  | "Skills"
  | "Resume"
  | "Contact"
  | "Music"
  | "Arcade";
export const apps: { id: AppId; short: string; subtitle: string }[] = [
  { id: "About Me", short: "About me", subtitle: "A little introduction" },
  {
    id: "Projects",
    short: "Projects",
    subtitle: "Selected work & experiments",
  },
  { id: "Skills", short: "Toolbox", subtitle: "Tools behind the work" },
  { id: "Resume", short: "Resume", subtitle: "Experience & education" },
  { id: "Contact", short: "Contact", subtitle: "Start a conversation" },
  { id: "Music", short: "Music", subtitle: "A soundtrack for your visit" },
  { id: "Arcade", short: "Arcade", subtitle: "Take a little play break" },
];
