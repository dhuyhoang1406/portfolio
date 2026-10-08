import { useEffect, useRef, useState } from "react";
import AppIcon from "./AppIcon";
import { musicTracks as tracks } from "../../data/music";
function time(value: number) {
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}
export default function Music() {
  const audio = useRef<HTMLAudioElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const localUrl = useRef<string | null>(null);
  const [index, setIndex] = useState(0);
  const [local, setLocal] = useState<{ name: string; url: string } | null>(
    null,
  );
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const [error, setError] = useState("");
  const src =
    local?.url ?? `${import.meta.env.BASE_URL}music/${tracks[index].file}`;
  useEffect(() => {
    const element = audio.current;
    return () => {
      element?.pause();
      element?.removeAttribute("src");
      element?.load();
      if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    };
  }, []);
  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);
  function select(next: number) {
    audio.current?.pause();
    setPlaying(false);
    setPosition(0);
    setError("");
    setLocal(null);
    setIndex(next);
  }
  async function toggle() {
    const a = audio.current;
    if (!a) return;
    if (!a.paused) a.pause();
    else {
      try {
        await a.play();
        setError("");
      } catch {
        setError("Could not play this track. Try another audio file.");
      }
    }
  }
  return (
    <div className="music-app">
      <span className="eyebrow">HOANG MEDIA PLAYER / MUSIC LIBRARY</span>
      <div className={`record-scene ${playing ? "is-playing" : ""}`}>
        <div className="record">
          <div className="record-label">
            h.<small>HOANG PLAYER</small>
          </div>
        </div>
        <span className="record-caption">
          MY PLAYLIST
          <br />
          SLOW DOWN. STAY A WHILE.
        </span>
      </div>
      <h2>{local?.name ?? tracks[index].name}</h2>
      <p>{local ? "Your local soundtrack" : tracks[index].artist}</p>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) =>
          setDuration(
            Number.isFinite(e.currentTarget.duration)
              ? e.currentTarget.duration
              : 0,
          )
        }
        onEnded={() => {
          setPlaying(false);
          setPosition(0);
        }}
        onError={() =>
          setError(
            "This audio could not be loaded. Choose another track or a local file.",
          )
        }
      />
      <label className="seek-control">
        <span className="sr-only">Playback position</span>
        <input
          aria-label="Playback position"
          type="range"
          min="0"
          max={duration || 1}
          step="0.1"
          value={Math.min(position, duration || 1)}
          onChange={(e) => {
            if (audio.current)
              audio.current.currentTime = Number(e.target.value);
            setPosition(Number(e.target.value));
          }}
        />
        <span>
          {time(position)} / {time(duration)}
        </span>
      </label>
      <div className="player-controls">
        <button
          aria-label="Previous track"
          onClick={() => select((index + tracks.length - 1) % tracks.length)}
        >
          ↤
        </button>
        <button
          className="play-button"
          aria-label={playing ? "Pause music" : "Play music"}
          onClick={() => void toggle()}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>
        <button
          aria-label="Next track"
          onClick={() => select((index + 1) % tracks.length)}
        >
          ↦
        </button>
        <label>
          Volume
          <input
            aria-label="Music volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="track-list">
        {tracks.map((t, i) => (
          <button
            key={t.name}
            aria-pressed={!local && index === i}
            onClick={() => select(i)}
          >
            <span>0{i + 1}</span>
            <strong>
              {t.name}
              <small>{t.artist}</small>
            </strong>
            <span>{!local && index === i ? "●" : "↗"}</span>
          </button>
        ))}
      </div>
      <div className="local-track">
        <span className="local-track-icon">
          <AppIcon id="Music" />
        </span>
        <div className="local-track-copy">
          <strong>
            {local ? "Your audio is ready" : "Bring your own soundtrack"}
          </strong>
          <span title={local?.name} aria-live="polite">
            {local?.name ?? "Choose an audio file from your device"}
          </span>
        </div>
        <button
          type="button"
          className="local-track-button"
          onClick={() => fileInput.current?.click()}
        >
          {local ? "Change file" : "Choose audio"}{" "}
          <span aria-hidden="true">＋</span>
        </button>
        <input
          ref={fileInput}
          hidden
          aria-label="Choose local music"
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            audio.current?.pause();
            if (localUrl.current) URL.revokeObjectURL(localUrl.current);
            const url = URL.createObjectURL(f);
            localUrl.current = url;
            setLocal({ name: f.name.replace(/\.[^.]+$/, ""), url });
            setPlaying(false);
            setPosition(0);
            setError("");
            e.target.value = "";
          }}
        />
      </div>
      <p className="muted">
        Your personal music collection. Files selected from your device stay in
        your browser. Music keeps playing when minimized and stops when you
        close this window.
      </p>
    </div>
  );
}
