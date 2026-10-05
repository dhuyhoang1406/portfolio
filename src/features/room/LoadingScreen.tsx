export default function LoadingScreen({
  progress,
  status = "Loading room assets",
}: {
  progress?: number;
  status?: string;
}) {
  const percent =
    progress === undefined
      ? undefined
      : Math.min(100, Math.max(0, Math.round(progress)));
  return (
    <div
      className="terminal-loading"
      role="status"
      aria-label="Loading workspace"
    >
      <div className="terminal-content">
        <span className="terminal-brand">HOANG WORKSPACE / BOOT</span>
        <p>
          <span className="terminal-prompt">~ $</span> start workspace
        </p>
        <div className="terminal-line">
          <span>[ OK ]</span> Portfolio interface ready
        </div>
        <div className="terminal-line">
          <span>[ … ]</span> {status}
          {percent !== undefined && <b>{percent}%</b>}
        </div>
        {percent !== undefined && (
          <progress
            aria-label="Room assets loading progress"
            value={percent}
            max={100}
          />
        )}
        <p className="terminal-command">
          Preparing your space<span className="terminal-cursor">▍</span>
        </p>
      </div>
    </div>
  );
}
