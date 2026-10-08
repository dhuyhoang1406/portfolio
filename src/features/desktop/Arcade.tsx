import { useEffect, useRef, useState } from "react";
const symbols = ["✳", "☾", "✿", "◇", "↗", "☀"];
function deck() {
  const cards = [...symbols, ...symbols].map((symbol, id) => ({ symbol, id }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
export default function Arcade() {
  const [cards, setCards] = useState(deck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function pick(id: number) {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id))
      return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (
        cards.find((c) => c.id === next[0])!.symbol ===
        cards.find((c) => c.id === next[1])!.symbol
      ) {
        setMatched((m) => [...m, ...next]);
        setFlipped([]);
      } else timer.current = setTimeout(() => setFlipped([]), 850);
    }
  }
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setCards(deck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }
  return (
    <div className="arcade-app">
      <span className="eyebrow">A SMALL BREAK / MEMORY CLUB</span>
      <h2>
        A little less work.
        <br />A little more play.
      </h2>
      <p>Find six matching pairs. Pick two cards and see what sticks.</p>
      <div className="game-score">
        <span>
          <b>{String(moves).padStart(2, "0")}</b> MOVES
        </span>
        <span>
          <b>{matched.length / 2} / 6</b> PAIRS
        </span>
        <button className="text-action" onClick={reset}>
          New game ↻
        </button>
      </div>
      <div className="memory-grid">
        {cards.map((c, i) => {
          const show = flipped.includes(c.id) || matched.includes(c.id);
          return (
            <button
              key={c.id}
              className={`${show ? "revealed" : ""} ${matched.includes(c.id) ? "matched" : ""}`}
              aria-label={`Card ${i + 1}${show ? `: ${c.symbol}` : ": face down"}`}
              aria-pressed={show}
              disabled={matched.includes(c.id)}
              onClick={() => pick(c.id)}
            >
              {show ? (
                c.symbol
              ) : (
                <span>
                  h.<small>{String(i + 1).padStart(2, "0")}</small>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="game-message" role="status">
        {matched.length === 12
          ? `All pairs found in ${moves} moves. Nicely done!`
          : "No timer. No rush. Just a moment to reset."}
      </p>
    </div>
  );
}
