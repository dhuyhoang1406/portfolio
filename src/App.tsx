import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import Desktop from "./features/desktop/Desktop";
import LoadingScreen from "./features/room/LoadingScreen";
import { profile } from "./data/profile";
const Room = lazy(() => import("./features/room/Room"));
class Boundary extends Component<
  { children: ReactNode; onError: () => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}
function initial2D() {
  if (
    new URLSearchParams(location.search).get("mode") === "2d" ||
    matchMedia("(max-width: 760px)").matches
  )
    return true;
  try {
    const c = document.createElement("canvas");
    return !(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return true;
  }
}
export default function App() {
  const [flat, setFlat] = useState(initial2D);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const onBusy = useCallback((v: boolean) => setBusy(v), []);
  const failure = useCallback(() => {
    setError(true);
    setFlat(true);
  }, []);
  const enter = useCallback(() => {
    if (!busy) setActive(true);
  }, [busy]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) setActive(false);
    }
    window.addEventListener("keydown", key);
    const q = matchMedia("(max-width: 760px)");
    const mobile = () => {
      if (q.matches) setFlat(true);
    };
    q.addEventListener("change", mobile);
    return () => {
      window.removeEventListener("keydown", key);
      q.removeEventListener("change", mobile);
    };
  }, [busy]);
  return (
    <main className={flat ? "app flat" : "app"}>
      <header className="site-header">
        <a className="brand" href="./">
          H
          <span>
            {profile.name}
            <small>{profile.role}</small>
          </span>
        </a>
        <div className="mode-tools">
          {flat ? (
            <button
              onClick={() => {
                setError(false);
                setFlat(false);
                setActive(false);
              }}
            >
              Explore the room ↗
            </button>
          ) : null}
        </div>
      </header>
      {error && (
        <p className="fallback-note" role="status">
          The 3D room is unavailable. Your portfolio is ready below.
        </p>
      )}
      {flat ? (
        <div className="flat-desktop">
          <Desktop />
        </div>
      ) : (
        <>
          <Boundary onError={failure}>
            <Suspense
              fallback={
                <LoadingScreen status="Initializing the room renderer" />
              }
            >
              <Room
                active={active}
                enter={enter}
                onBusy={onBusy}
                onFailure={failure}
              />
            </Suspense>
          </Boundary>
          <div className="room-caption">
            {active ? (
              <button disabled={busy} onClick={() => setActive(false)}>
                ← Back to room <small>ESC</small>
              </button>
            ) : (
              <>
                <span className="eyebrow">A LITTLE SPACE TO CREATE</span>
                <h1>Welcome to my workspace.</h1>
                <p>Click the room to explore · Drag to rotate</p>
                <button disabled={busy} onClick={enter}>
                  {busy ? "Moving camera…" : "Enter computer ↗"}
                </button>
              </>
            )}
          </div>
        </>
      )}
      <div className="site-footer">
        <span>
          © {new Date().getFullYear()} {profile.name.toUpperCase()}
        </span>
        <span>
          BUILT WITH CURIOSITY <span className="accent">✳</span>
        </span>
      </div>
    </main>
  );
}
