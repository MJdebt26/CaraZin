// Slim promotional bar that sits above the sticky header on standalone pages.
// Non-sticky: scrolls away, leaving the header pinned — the standard premium pattern.
export default function AnnouncementBar() {
  return (
    <div className="anno-bar" role="note">
      <div className="anno-track">
        <span>Free shipping over $150</span>
        <span className="anno-dot">·</span>
        <span>Ships from Vancouver, BC</span>
        <span className="anno-dot">·</span>
        <span>30-day returns</span>
      </div>
    </div>
  );
}
