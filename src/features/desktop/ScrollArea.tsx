import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode, PointerEvent, KeyboardEvent } from "react";
// Native scrollbars can be hard to hit inside a CSS 3D transform. This DOM
// scrollbar uses pointer capture and screen-space measurements for its drag.
export default function ScrollArea({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const area = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const id = useId();
  const [metrics, setMetrics] = useState({
    height: 0,
    total: 0,
    top: 0,
    track: 0,
  });
  const drag = useRef<{ y: number; top: number; ratio: number } | null>(null);
  function measure() {
    const el = viewport.current;
    if (el)
      setMetrics({
        height: el.clientHeight,
        total: el.scrollHeight,
        top: el.scrollTop,
        track: track.current?.clientHeight ?? 0,
      });
  }
  useEffect(() => {
    const observer = new ResizeObserver(measure);
    for (const el of [viewport.current, content.current, track.current])
      if (el) observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = area.current;
    if (!element) return;
    function wheel(event: WheelEvent) {
      const el = viewport.current;
      if (
        !el ||
        event.ctrlKey ||
        !event.deltaY ||
        el.scrollHeight <= el.clientHeight
      )
        return;
      // CSS-transformed 3D surfaces do not reliably receive native wheel scrolling.
      // Own the wheel on both content and track, avoiding native double scrolling.
      event.preventDefault();
      event.stopPropagation();
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? el.clientHeight
            : 1;
      el.scrollTop += event.deltaY * unit;
      measure();
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, []);
  const range = Math.max(0, metrics.total - metrics.height);
  const thumbHeight = Math.min(
    metrics.track,
    Math.max(28, (metrics.track * metrics.height) / Math.max(1, metrics.total)),
  );
  const travel = metrics.track - thumbHeight;
  function start(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || !viewport.current || !track.current || range <= 0)
      return;
    e.preventDefault();
    const rect = track.current.getBoundingClientRect();
    const scale = rect.height / Math.max(1, metrics.track);
    if (e.target === e.currentTarget) {
      const offset = (e.clientY - rect.top) / scale - thumbHeight / 2;
      viewport.current.scrollTop = Math.max(
        0,
        Math.min(range, (offset / Math.max(1, travel)) * range),
      );
    }
    drag.current = {
      y: e.clientY,
      top: viewport.current.scrollTop,
      ratio: range / Math.max(1, travel * scale),
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    measure();
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    if (drag.current && viewport.current) {
      viewport.current.scrollTop =
        drag.current.top + (e.clientY - drag.current.y) * drag.current.ratio;
      measure();
    }
  }
  function key(e: KeyboardEvent) {
    const el = viewport.current;
    if (!el) return;
    const amount = {
      ArrowDown: 40,
      ArrowUp: -40,
      PageDown: metrics.height * 0.85,
      PageUp: -metrics.height * 0.85,
      Home: -range,
      End: range,
    }[e.key];
    if (amount === undefined) return;
    e.preventDefault();
    el.scrollTop += amount;
    measure();
  }
  return (
    <div className="window-scroll-area" ref={area}>
      <div
        className="window-content"
        id={id}
        ref={viewport}
        tabIndex={0}
        onScroll={measure}
      >
        <div ref={content}>{children}</div>
      </div>
      <div
        ref={track}
        className="window-scrollbar"
        role="scrollbar"
        aria-label={`Scroll ${label}`}
        aria-controls={id}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={Math.round(range)}
        aria-valuenow={Math.round(metrics.top)}
        aria-disabled={range === 0}
        tabIndex={range > 0 ? 0 : -1}
        data-scrollable={range > 0}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onKeyDown={key}
      >
        <div
          className="window-scrollbar-thumb"
          style={{
            height: thumbHeight,
            transform: `translateY(${range > 0 ? (metrics.top / range) * travel : 0}px)`,
          }}
        />
      </div>
    </div>
  );
}
