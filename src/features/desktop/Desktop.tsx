import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { profile } from "../../data/profile";
import { playClick } from "./clickSound";
import { apps } from "./apps";
import type { AppId } from "./apps";
import AppIcon from "./AppIcon";
import AppContent from "./AppContent";
import ScrollArea from "./ScrollArea";
import ThemePanel from "./ThemePanel";
import { appearanceKey, readAppearance } from "./themes";
import type { Appearance } from "./themes";
import type { CSSProperties } from "react";
import "./desktop.css";
type Win = {
  id: AppId;
  x: number;
  y: number;
  z: number;
  min: boolean;
  max?: boolean;
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
  function clamp(w: Win) {
    const el = root.current;
    if (!el) return w;
    return {
      ...w,
      x: Math.max(
        0,
        Math.min(
          w.x,
          Math.max(0, el.clientWidth - Math.min(590, el.clientWidth - 24)),
        ),
      ),
      y: Math.max(
        44,
        Math.min(
          w.y,
          el.clientHeight - Math.min(490, el.clientHeight - 132) - 64,
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
            hoang<span>workspace</span>
          </strong>
          <span className="workspace-tag">PERSONAL / 01</span>
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
            Make
            <br />
            it
            <br />
            <i>matter.</i>
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
            Workspace radio<small>Two original ambient tracks</small>
          </span>
          <b>↗</b>
        </button>
        <button onClick={() => open("Arcade")}>
          <AppIcon id="Arcade" />
          <span>
            Memory club<small>A quick play break</small>
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
            style={{ left: w.x, top: w.y, zIndex: w.z }}
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
            <ScrollArea label={w.id}>
              <AppContent id={w.id} onOpen={open} />
            </ScrollArea>
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
          <span className="eyebrow">YOUR WORKSPACE</span>
          {apps.map((a) => (
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
          <footer>Make something worth making.</footer>
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
          <span>Workspace</span>
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
        <span className="tray">
          <i /> Local workspace <span>H / OS</span>
        </span>
      </footer>
    </div>
  );
}
