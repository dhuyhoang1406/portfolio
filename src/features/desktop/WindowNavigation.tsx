import { useState } from "react";
import { apps, type AppId } from "./apps";
import AppIcon from "./AppIcon";
export default function WindowNavigation({
  id,
  onOpen,
  onAppearance,
}: {
  id: AppId;
  onOpen: (id: AppId) => void;
  onAppearance: () => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="explorer-tools">
      <div className="explorer-menu">
        <button aria-expanded={menu} onClick={() => setMenu(!menu)}>
          Applications ▾
        </button>
        <button onClick={onAppearance}>Appearance</button>
        <span>Hoang OS</span>
        {menu && (
          <nav className="explorer-app-menu" aria-label="Switch application">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onOpen(app.id);
                  setMenu(false);
                }}
              >
                <AppIcon id={app.id} />
                {app.short}
              </button>
            ))}
          </nav>
        )}
      </div>
      <div className="explorer-address">
        <span>Location</span>
        <div>
          <AppIcon id={id} />
          <span>
            This PC <b>›</b>{" "}
            {id === "Music" || id === "Arcade" ? "Leisure" : "Portfolio"}{" "}
            <b>›</b> {id}
          </span>
        </div>
        <button aria-label={`Go to ${id} location`} onClick={() => onOpen(id)}>
          ↵
        </button>
      </div>
    </div>
  );
}
