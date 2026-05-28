export default function CompassArrow({ rotation, size = 220, unavailable = false }) {
  return (
    <div className="compass-wrap" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.25s ease-out", display: "block" }}
      >
        <circle cx="50" cy="50" r="48" fill="var(--compass-bg)" stroke="var(--compass-ring)" strokeWidth="2" />
        <polygon points="50,12 58,55 50,62 42,55" fill={unavailable ? "var(--text-subtle)" : "var(--accent)"} />
        <polygon points="50,88 58,55 50,62 42,55" fill="var(--surface-3)" />
        <circle cx="50" cy="50" r="5" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
      </svg>
      {unavailable && (
        <div className="compass-unavailable">heading unavailable</div>
      )}
    </div>
  );
}
