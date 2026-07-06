// Trust signals shown directly under the Add-to-Cart button — the reassurance
// strip every premium storefront runs at the point of purchase. Pure component.
const ICONS = {
  lock: (
    <path d="M6 8V6a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1Zm2 0h4V6a2 2 0 1 0-4 0v2Z" />
  ),
  truck: (
    <path d="M2 5h10v8H2V5Zm11 3h3l3 3v2h-6V8ZM6.5 16.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
  ),
  refresh: (
    <path d="M4 10a6 6 0 0 1 10-4.5V3l3 3-3 3V6.7A4 4 0 0 0 6 10H4Zm12 0a6 6 0 0 1-10 4.5V17l-3-3 3-3v2.3A4 4 0 0 0 14 10h2Z" />
  ),
};

const ITEMS: { icon: keyof typeof ICONS; label: string }[] = [
  { icon: 'lock', label: 'Secure SSL checkout' },
  { icon: 'truck', label: 'Free shipping over $150' },
  { icon: 'refresh', label: '30-day easy returns' },
];

export default function TrustRow() {
  return (
    <div className="trust-row">
      {ITEMS.map((it) => (
        <div className="trust-item" key={it.label}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
            {ICONS[it.icon]}
          </svg>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
