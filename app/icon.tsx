import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#16a34a" rx="6" />
        <circle cx="16" cy="10" r="6" fill="white" />
        <circle cx="12" cy="17" r="6" fill="white" />
        <circle cx="20" cy="17" r="6" fill="white" />
        <polygon points="14,22 18,22 19,28 13,28" fill="white" />
      </svg>
    ),
    {
      ...size,
    }
  );
}
