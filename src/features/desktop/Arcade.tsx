import { useEffect, useRef, useState } from "react";
import { games } from "../../data/games";
export default function Arcade() {
  const game = games[0];
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [version, setVersion] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: game.width,
    height: game.height,
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const scale = Math.min(
    dimensions.width / game.width,
    dimensions.height / game.height,
  );
  const viewport = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const exitButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    function measure() {
      if (element)
        setDimensions({
          width: element.clientWidth,
          height: element.clientHeight,
        });
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!running || loaded) return;
    const timer = setTimeout(() => setSlow(true), 15000);
    return () => clearTimeout(timer);
  }, [running, loaded, version]);
  useEffect(() => {
    function changed() {
      setFullscreen(document.fullscreenElement === viewport.current);
    }
    function key(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        document.fullscreenElement === viewport.current
      ) {
        event.preventDefault();
        event.stopPropagation();
        void document.exitFullscreen();
      }
    }
    document.addEventListener("fullscreenchange", changed);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("fullscreenchange", changed);
      document.removeEventListener("keydown", key);
    };
  }, []);
  useEffect(() => {
    if (fullscreen) exitButton.current?.focus();
  }, [fullscreen]);
  async function toggleFullscreen() {
    try {
      setFullscreenError("");
      if (document.fullscreenElement === viewport.current)
        await document.exitFullscreen();
      else await viewport.current?.requestFullscreen();
    } catch {
      setFullscreenError(
        "Fullscreen is unavailable in this browser. You can maximize the Arcade window instead.",
      );
    }
  }
  function start() {
    setLoaded(false);
    setSlow(false);
    setRunning(true);
    setVersion((v) => v + 1);
  }
  return (
    <div
      className={`arcade-app external-arcade ${running ? "game-running" : ""}`}
    >
      <div className="game-library-heading">
        <span className="eyebrow">HOANG OS / GAME LIBRARY</span>
        <span className="game-host-badge">EXTERNAL GAME</span>
      </div>
      <div className="game-summary">
        <div className="game-cover" aria-hidden="true">
          <span>▲</span>
          <b>
            CELESTE<small>CLASSIC</small>
          </b>
        </div>
        <div>
          <h2>{game.name}</h2>
          <p>{game.description}</p>
          <span className="muted">
            {game.category} · {game.creator}
          </span>
        </div>
      </div>
      <div className="game-toolbar">
        <button className="primary-action" onClick={start}>
          {running ? "Restart game" : "Play Celeste Classic"}
        </button>
        {running && (
          <button
            className="text-action"
            onClick={() => {
              setRunning(false);
              setLoaded(false);
              setSlow(false);
            }}
          >
            Stop game
          </button>
        )}
        {running && (
          <button
            className="text-action"
            onClick={() => void toggleFullscreen()}
          >
            Fullscreen game ⛶
          </button>
        )}
        <a href={game.pageUrl} target="_blank" rel="noreferrer">
          Open on itch.io ↗
        </a>
      </div>
      <div
        className="external-game-viewport"
        ref={viewport}
        style={
          fullscreen
            ? undefined
            : { aspectRatio: `${game.width} / ${game.height}` }
        }
      >
        {fullscreen && (
          <button
            ref={exitButton}
            className="game-fullscreen-exit"
            onClick={() => void toggleFullscreen()}
            aria-label="Exit game fullscreen"
          >
            Exit fullscreen ⛶
          </button>
        )}
        {running ? (
          <iframe
            key={version}
            ref={iframe}
            title={game.name}
            src={game.embedUrl}
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            allow="autoplay; fullscreen 'none'; gamepad"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => {
              setLoaded(true);
              iframe.current?.focus();
            }}
            style={{
              width: game.width,
              height: game.height,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          />
        ) : (
          <div className="game-launch-screen">
            <div className="pixel-mountain">▲</div>
            <strong>
              One mountain.
              <br />A lot of determination.
            </strong>
            <span>Press Play to load the game from its official host.</span>
          </div>
        )}
      </div>
      {fullscreenError && <p role="status">{fullscreenError}</p>}
      {running && !loaded && (
        <p role="status">
          {slow
            ? "The game host is taking a while. You can stop the game or open it on itch.io."
            : "Connecting to the game host…"}
        </p>
      )}
      <div className="game-instructions">
        <span className="eyebrow">CONTROLS</span>
        <p>{game.controls}</p>
        <p className="game-sound-note">
          Sound too loud? Click <strong>Sound</strong> in the game’s bottom bar
          to mute/unmute. For fullscreen, use <strong>Fullscreen game</strong>{" "}
          above.
        </p>
        <p className="muted">
          A keyboard is recommended. On a phone, use the game’s own controls if
          available. If the frame stays blank, use “Open on itch.io”.
        </p>
      </div>
      <p className="muted">
        Created by {game.creator}. Hosted externally on itch.io; requires an
        internet connection. Closing this window or pressing Stop unloads the
        game.
      </p>
    </div>
  );
}
