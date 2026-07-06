import { ImageResponse } from 'next/og';

export const alt = 'CARAZIN — Premium Automotive Accessories · Vancouver';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Branded social share card (1200×630). Rendered on demand so every link that
// gets shared shows a proper CaraZin card instead of a bare URL.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 46,
            letterSpacing: 6,
            color: '#9a9a96',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          Vancouver, BC
        </div>
        <div style={{ display: 'flex', fontSize: 150, fontWeight: 700, letterSpacing: 8 }}>
          <span style={{ color: '#ffffff' }}>CARA</span>
          <span style={{ color: '#b8944a' }}>ZIN</span>
        </div>
        <div style={{ display: 'flex', width: 120, height: 3, background: '#b8944a', margin: '40px 0' }} />
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 1,
          }}
        >
          Premium Automotive Accessories
        </div>
      </div>
    ),
    { ...size },
  );
}
