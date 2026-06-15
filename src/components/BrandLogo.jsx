// Inline SVG logo: a heart + heartbeat line in the brand gradient.
export default function BrandLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="brand-logo" aria-hidden="true">
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16b8a6" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#brandGrad)" />
      <path
        d="M32 14c-6 0-9 4-9 9 0 4 2.5 7 5 9.5L32 36l4-3.5c2.5-2.5 5-5.5 5-9.5 0-5-3-9-9-9z"
        fill="#fff"
        opacity="0.95"
      />
      <path
        d="M14 38h10l3-7 5 14 4-9 2 2h12"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
