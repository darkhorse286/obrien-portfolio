import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(to bottom, #FEF3C7, #FFFFFF)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#111827', marginBottom: 20 }}>
          O'Brien & Son
        </div>
        <div style={{ fontSize: 40, color: '#374151', textAlign: 'center' }}>
          Software Architecture & Security
        </div>
        <div style={{ fontSize: 30, color: '#6B7280', marginTop: 40, textAlign: 'center' }}>
          The Same Standards. Different Materials.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}