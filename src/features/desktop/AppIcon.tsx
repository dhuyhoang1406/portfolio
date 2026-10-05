import type { AppId } from "./apps";
export default function AppIcon({ id }: { id: AppId | "Theme" | "Launcher" }) {
  const paths = {
    "About Me": (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 20v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    Projects: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9H3Z" />
        <path d="M3 11h18" />
      </>
    ),
    Skills: (
      <>
        <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" />
      </>
    ),
    Resume: (
      <>
        <path d="M6 3h8l4 4v14H6Z" />
        <path d="M14 3v5h4M9 12h6m-6 4h6" />
      </>
    ),
    Contact: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 7 9-7" />
      </>
    ),
    Theme: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" />
      </>
    ),
    Launcher: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[id]}
    </svg>
  );
}
