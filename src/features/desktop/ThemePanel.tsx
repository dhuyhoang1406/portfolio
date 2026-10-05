import { useEffect, useRef } from "react";
import { themes } from "./themes";
import type { Appearance } from "./themes";
export default function ThemePanel({
  value,
  onChange,
  onClose,
}: {
  value: Appearance;
  onChange: (v: Appearance) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current
      ?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
      ?.focus();
  }, []);
  return (
    <div
      className="theme-panel"
      ref={panel}
      role="dialog"
      aria-label="Desktop appearance"
    >
      <header>
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h3>Appearance</h3>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close appearance"
        >
          ×
        </button>
      </header>
      <p>A different mood. The same workspace.</p>
      <div className="theme-options">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange({ theme: t.id, accent: t.accent })}
            aria-pressed={value.theme === t.id}
            aria-label={`Use ${t.name} theme`}
          >
            <span className={`theme-preview preview-${t.id}`}>
              <i />
              <b />
            </span>
            <strong>{t.name}</strong>
            <small>{t.description}</small>
          </button>
        ))}
      </div>
      <label className="accent-picker">
        Accent color{" "}
        <span>
          <input
            type="color"
            aria-label="Accent color"
            value={value.accent}
            onChange={(e) => onChange({ ...value, accent: e.target.value })}
          />
          <code>{value.accent.toUpperCase()}</code>
        </span>
      </label>
      <p className="theme-note">Saved on this device.</p>
    </div>
  );
}
