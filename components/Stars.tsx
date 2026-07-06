// Presentational star rating. Two layered rows — a muted base and a gold overlay
// clipped to the exact fraction — so half-stars render precisely with no SVG id
// collisions. Pure component: safe to use inside Server Components.
export default function Stars({ value, size = 12 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className="stars"
      style={{ fontSize: `${size}px` }}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <span className="stars-bg" aria-hidden="true">★★★★★</span>
      <span className="stars-fg" aria-hidden="true" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}
