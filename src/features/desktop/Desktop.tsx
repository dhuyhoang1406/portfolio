import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { profile } from "../../data/profile";
import { playClick } from "./clickSound";
import { apps } from "./apps";
import type { AppId } from "./apps";
import AppIcon from "./AppIcon";
import AppContent from "./AppContent";
import ScrollArea from "./ScrollArea";
import WindowNavigation from "./WindowNavigation";
import ThemePanel from "./ThemePanel";
import { appearanceKey, readAppearance } from "./themes";
import type { Appearance } from "./themes";
import type { CSSProperties } from "react";
import "./desktop.css";
import "./os-shell.css";
type Win = {
  id: AppId;
  x: number;
  y: number;
  z: number;
  min: boolean;
  max?: boolean;
  width?: number;
  height?: number;
};
export default function Desktop({
  embedded = false,
  enabled = true,
}: {
  embedded?: boolean;
  enabled?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef(2);
  const [appearance, setAppearance] = useState(readAppearance);
  const [themeOpen, setThemeOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);
  function showDesktop() {
    setWindows((ws) => ws.map((w) => ({ ...w, min: true })));
  }

  const themeButton = useRef<HTMLButtonElement>(null);
  const launcherButton = useRef<HTMLButtonElement>(null);
  function changeAppearance(value: Appearance) {
    setAppearance(value);
    try {
      localStorage.setItem(appearanceKey, JSON.stringify(value));
    } catch {
      /* Storage is optional. */
    }
  }
  function closeTheme() {
    setThemeOpen(false);
    themeButton.current?.focus();
  }
  const [windows, setWindows] = useState<Win[]>([
    { id: "About Me", x: 164, y: 60, z: 1, min: false },
  ]);
  const drag = useRef<{
    id: AppId;
    startX: number;
    startY: number;
    x: number;
    y: number;
    scale: number;
  } | null>(null);
  const resize = useRef<{
    id: AppId;
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  } | null>(null);
  function resizeWindow(id: AppId, width: number, height: number) {
    const el = root.current;
    if (!el) return;
    setWindows((ws) =>
      ws.map((w) =>
        w.id === id
          ? clamp({
              ...w,
              width: Math.min(Math.max(360, width), el.clientWidth - 24),
              height: Math.min(Math.max(270, height), el.clientHeight - 132),
            })
          : w,
      ),
    );
  }
  function clamp(w: Win) {
    const el = root.current;
    if (!el) return w;
    return {
      ...w,
      width:
        w.width === undefined
          ? undefined
          : Math.min(w.width, el.clientWidth - 24),
      height:
        w.height === undefined
          ? undefined
          : Math.min(w.height, el.clientHeight - 132),
      x: Math.max(
        0,
        Math.min(
          w.x,
          Math.max(
            0,
            el.clientWidth - Math.min(w.width ?? 590, el.clientWidth - 24),
          ),
        ),
      ),
      y: Math.max(
        44,
        Math.min(
          w.y,
          el.clientHeight -
            Math.min(w.height ?? 490, el.clientHeight - 132) -
            64,
        ),
      ),
    };
  }
  useEffect(() => {
    const observer = new ResizeObserver(() =>
      setWindows((ws) => ws.map(clamp)),
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  function front(id: AppId) {
    const z = ++counter.current;
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, z, min: false } : w)),
    );
  }
  function open(id: AppId) {
    setLauncherOpen(false);
    if (windows.some((w) => w.id === id)) {
      front(id);
      return;
    }
    const z = ++counter.current;
    setWindows((ws) => [
      ...ws,
      clamp({
        id,
        max: id === "Arcade",
        x: 180 + ws.length * 20,
        y: 65 + ws.length * 20,
        z,
        min: false,
      }),
    ]);
  }
  function start(e: ReactPointerEvent, id: AppId) {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    front(id);
    const w = windows.find((w) => w.id === id)!;
    if (w.max) return;
    const el = root.current!;
    drag.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      x: w.x,
      y: w.y,
      scale: el.getBoundingClientRect().width / el.clientWidth,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: ReactPointerEvent) {
    const d = drag.current;
    if (!d) return;
    setWindows((ws) =>
      ws.map((w) =>
        w.id === d.id
          ? clamp({
              ...w,
              x: d.x + (e.clientX - d.startX) / d.scale,
              y: d.y + (e.clientY - d.startY) / d.scale,
            })
          : w,
      ),
    );
  }
  const focused = windows
    .filter((w) => !w.min)
    .reduce<Win | undefined>(
      (top, w) => (!top || w.z > top.z ? w : top),
      undefined,
    )?.id;
  return (
    <div
      ref={root}
      data-theme={appearance.theme}
      style={{ "--desktop-accent": appearance.accent } as CSSProperties}
      onPointerDown={(e) => {
        if (
          !(e.target as HTMLElement).closest(
            ".theme-panel,.theme-toggle,.launcher-panel,.start",
          )
        ) {
          setThemeOpen(false);
          setLauncherOpen(false);
        }
      }}
      className={`desktop ${embedded ? "embedded" : ""}`}
      onPointerDownCapture={() => {
        if (enabled) playClick();
      }}
      onKeyDownCapture={(e) => {
        if (e.key === "Escape" && (themeOpen || launcherOpen)) {
          e.stopPropagation();
          if (themeOpen) closeTheme();
          else launcherButton.current?.focus();
          setLauncherOpen(false);
        }

        if (
          enabled &&
          !e.repeat &&
          (e.key === "Enter" || e.key === " ") &&
          (e.target as HTMLElement).closest("button,a")
        )
          playClick();
      }}
      inert={!enabled}
      aria-label="Hoang OS desktop"
    >
      <div className="desktop-top">
        <div className="os-brand">
          <span className="os-mark">h.</span>
          <strong>
            hoang<span>OS</span>
          </strong>
          <span className="workspace-tag">PERSONAL COMPUTER</span>
        </div>
        <div className="desktop-top-actions">
          <span className="desktop-location">
            HCMC, VN <i />
          </span>
          <button
            ref={themeButton}
            className="theme-toggle"
            aria-label="Customize desktop theme"
            aria-expanded={themeOpen}
            onClick={() => {
              if (themeOpen) closeTheme();
              else {
                setThemeOpen(true);
                setLauncherOpen(false);
              }
            }}
          >
            <AppIcon id="Theme" />
            <span>Appearance</span>
          </button>
        </div>
      </div>
      <div className="wallpaper" aria-hidden="true">
        <div className="wallpaper-orbit" />
        <div className="wallpaper-copy">
          <span className="wallpaper-label">HOANG’S PERSONAL WORKSPACE</span>
          <h2>
            hoang<span className="wallpaper-os"> OS</span>
          </h2>
          <span className="wallpaper-coordinate">JAVASCRIPT / TYPESCRIPT</span>
        </div>
        <div className="wallpaper-signature">
          {profile.name.toUpperCase()} <span>{profile.role.toUpperCase()}</span>
        </div>
      </div>
      <aside className="desktop-widget">
        <span className="eyebrow">OFF THE CLOCK</span>
        <strong>
          A little room
          <br />
          for curiosity.
        </strong>
        <button onClick={() => open("Music")}>
          <AppIcon id="Music" />
          <span>
            Workspace radio<small>My personal playlist</small>
          </span>
          <b>↗</b>
        </button>
        <button onClick={() => open("Arcade")}>
          <AppIcon id="Arcade" />
          <span>
            Game library<small>Celeste Classic</small>
          </span>
          <b>↗</b>
        </button>
      </aside>
      {themeOpen && (
        <ThemePanel
          value={appearance}
          onChange={changeAppearance}
          onClose={closeTheme}
        />
      )}
      <nav className="desktop-icons" aria-label="Applications">
        {apps.map((a) => (
          <button
            key={a.id}
            onClick={() => open(a.id)}
            aria-label={`Open ${a.id}`}
          >
            <span
              className={`icon-art app-icon-${a.id.toLowerCase().replaceAll(" ", "-")}`}
            >
              <AppIcon id={a.id} />
            </span>
            <span>{a.short}</span>
          </button>
        ))}
      </nav>
      <div className="windows-layer">
        {windows.map((w) => (
          <section
            key={w.id}
            hidden={w.min}
            className={`window ${focused === w.id ? "window-active" : ""} ${w.max ? "window-maximized" : ""}`}
            aria-label={w.id}
            style={{
              left: w.x,
              top: w.y,
              zIndex: w.z,
              width: w.max ? undefined : w.width,
              height: w.max ? undefined : w.height,
            }}
            onPointerDown={() => front(w.id)}
            onFocusCapture={() => {
              if (focused !== w.id) front(w.id);
            }}
          >
            <header
              className="titlebar"
              tabIndex={0}
              aria-label={`Move ${w.id} window with arrow keys`}
              onKeyDown={(e) => {
                const directions: Record<string, [number, number]> = {
                  ArrowLeft: [-16, 0],
                  ArrowRight: [16, 0],
                  ArrowUp: [0, -16],
                  ArrowDown: [0, 16],
                };
                const delta = directions[e.key];
                if (!delta || w.max || e.target !== e.currentTarget) return;
                e.preventDefault();
                front(w.id);
                setWindows((ws) =>
                  ws.map((v) =>
                    v.id === w.id
                      ? clamp({ ...v, x: v.x + delta[0], y: v.y + delta[1] })
                      : v,
                  ),
                );
              }}
              onDoubleClick={(e) => {
                if (!(e.target as HTMLElement).closest("button"))
                  setWindows((ws) =>
                    ws.map((v) => (v.id === w.id ? { ...v, max: !v.max } : v)),
                  );
              }}
              onPointerDown={(e) => start(e, w.id)}
              onPointerMove={move}
              onPointerUp={() => {
                drag.current = null;
              }}
              onLostPointerCapture={() => {
                drag.current = null;
              }}
            >
              <span>
                <AppIcon id={w.id} />
                <span>{w.id}</span>
              </span>
              <div>
                <button
                  aria-label={`Minimize ${w.id}`}
                  onClick={() =>
                    setWindows((ws) =>
                      ws.map((v) => (v.id === w.id ? { ...v, min: true } : v)),
                    )
                  }
                >
                  —
                </button>
                <button
                  aria-label={`${w.max ? "Restore size of" : "Maximize"} ${w.id}`}
                  onClick={() =>
                    setWindows((ws) =>
                      ws.map((v) =>
                        v.id === w.id ? { ...v, max: !v.max } : v,
                      ),
                    )
                  }
                >
                  {w.max ? "❐" : "□"}
                </button>
                <button
                  aria-label={`Close ${w.id}`}
                  onClick={() =>
                    setWindows((ws) => ws.filter((v) => v.id !== w.id))
                  }
                >
                  ×
                </button>
              </div>
            </header>
            <WindowNavigation
              id={w.id}
              onOpen={open}
              onAppearance={() => setThemeOpen(true)}
            />
            <div
              className={`window-workspace ${w.id === "Music" || w.id === "Arcade" ? "window-media-workspace" : ""}`}
            >
              {w.id !== "Music" && w.id !== "Arcade" && (
                <nav
                  className="explorer-sidebar"
                  aria-label={`${w.id} portfolio navigation`}
                >
                  <span>PORTFOLIO</span>
                  {apps
                    .filter((a) => a.id !== "Music" && a.id !== "Arcade")
                    .map((a) => (
                      <button
                        key={a.id}
                        aria-current={a.id === w.id ? "page" : undefined}
                        onClick={() => open(a.id)}
                      >
                        <AppIcon id={a.id} />
                        {a.short}
                      </button>
                    ))}
                  <div>
                    <span>QUICK LINKS</span>
                    <button onClick={() => open("Music")}>
                      <AppIcon id="Music" />
                      Music
                    </button>
                    <button onClick={() => open("Arcade")}>
                      <AppIcon id="Arcade" />
                      Games
                    </button>
                  </div>
                </nav>
              )}
              <ScrollArea label={w.id}>
                <AppContent id={w.id} onOpen={open} />
              </ScrollArea>
            </div>
            {!w.max && (
              <button
                className="window-resizer"
                aria-label={`Resize ${w.id} window with arrow keys`}
                onKeyDown={(e) => {
                  const directions: Record<string, [number, number]> = {
                    ArrowLeft: [-20, 0],
                    ArrowRight: [20, 0],
                    ArrowUp: [0, -20],
                    ArrowDown: [0, 20],
                  };
                  const d = directions[e.key];
                  if (!d) return;
                  e.preventDefault();
                  e.stopPropagation();
                  resizeWindow(
                    w.id,
                    (w.width ?? 590) + d[0],
                    (w.height ??
                      Math.min(490, root.current!.clientHeight - 132)) + d[1],
                  );
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  front(w.id);
                  const section = e.currentTarget.closest(
                    ".window",
                  ) as HTMLElement;
                  resize.current = {
                    id: w.id,
                    x: e.clientX,
                    y: e.clientY,
                    width: section.offsetWidth,
                    height: section.offsetHeight,
                    scale:
                      root.current!.getBoundingClientRect().width /
                      root.current!.clientWidth,
                  };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  const r = resize.current;
                  if (r)
                    resizeWindow(
                      r.id,
                      r.width + (e.clientX - r.x) / r.scale,
                      r.height + (e.clientY - r.y) / r.scale,
                    );
                }}
                onPointerUp={() => {
                  resize.current = null;
                }}
                onLostPointerCapture={() => {
                  resize.current = null;
                }}
              >
                ◢
              </button>
            )}
            <footer className="window-footer">
              <span>workspace / {w.id.toLowerCase()}</span>
              <span>◌ Personal portfolio</span>
            </footer>
          </section>
        ))}
      </div>
      {launcherOpen && (
        <div
          className="launcher-panel"
          role="dialog"
          aria-label="Application launcher"
        >
          <header>
            <span className="os-mark">h.</span>
            <div>
              <strong>{profile.name}</strong>
              <small>{profile.role}</small>
            </div>
          </header>
          <label className="launcher-search">
            <span className="sr-only">Search applications</span>
            <input
              aria-label="Search applications"
              placeholder="Search applications…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <span className="eyebrow">APPLICATIONS</span>
          {apps
            .filter((a) =>
              `${a.id} ${a.subtitle}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((a) => (
              <button
                key={a.id}
                aria-label={`Launch ${a.id}`}
                onClick={() => open(a.id)}
              >
                <span className="launcher-icon">
                  <AppIcon id={a.id} />
                </span>
                <span>
                  <strong>{a.id}</strong>
                  <small>{a.subtitle}</small>
                </span>
                <span>↗</span>
              </button>
            ))}
          {!apps.some((a) =>
            `${a.id} ${a.subtitle}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          ) && <p className="launcher-empty">No applications found.</p>}
          <footer>
            <button
              onClick={() => {
                showDesktop();
                setLauncherOpen(false);
              }}
            >
              ▤ Show desktop
            </button>
            <button
              onClick={() => {
                setThemeOpen(true);
                setLauncherOpen(false);
              }}
            >
              ⚙ Settings
            </button>
          </footer>
        </div>
      )}
      <footer className="taskbar">
        <button
          ref={launcherButton}
          className="start"
          aria-label="Open application launcher"
          aria-expanded={launcherOpen}
          onClick={() => {
            setLauncherOpen(!launcherOpen);
            setThemeOpen(false);
          }}
        >
          <AppIcon id="Launcher" />
          <span>Start</span>
        </button>
        <div className="taskbar-divider" />
        <div className="tasks">
          {windows.map((w) => (
            <button
              className={`${w.min ? "minimized" : ""} ${focused === w.id ? "task-active" : ""}`}
              key={w.id}
              onClick={() => {
                if (!w.min && focused === w.id)
                  setWindows((ws) =>
                    ws.map((v) => (v.id === w.id ? { ...v, min: true } : v)),
                  );
                else front(w.id);
              }}
              aria-label={
                !w.min && focused === w.id
                  ? `Minimize ${w.id} from taskbar`
                  : `Restore ${w.id}`
              }
              aria-pressed={!w.min && focused === w.id}
            >
              <AppIcon id={w.id} />
              <span>{w.id}</span>
              <i />
            </button>
          ))}
        </div>
        <div className="tray">
          <i />
          <span className="tray-system">HOANG OS</span>
          <time dateTime={clock.toISOString()}>
            {clock.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            <small>
              {clock.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
              })}
            </small>
          </time>
          <button
            className="show-desktop"
            aria-label="Show desktop"
            onClick={showDesktop}
          >
            ▯
          </button>
        </div>
      </footer>
    </div>
  );
}
