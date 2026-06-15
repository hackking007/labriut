// Visual iris "topography" map. Places each analyzed zone at its
// approximate iridology location on the iris and color-codes it by
// band, so the user can SEE which part of the eye each finding came
// from. Pure SVG — no external assets. (Demo / iridology-style.)

// Approximate position of each zone on the iris.
//   r = distance from center (0 = pupil, 1 = outer rim)
//   a = angle in degrees (0 = right/3 o'clock, -90 = top/12 o'clock)
const POS = {
  nervous: { r: 0.62, a: -90 },   // top
  circulation: { r: 0.6, a: -35 }, // upper side (2–3 o'clock)
  digestive: { r: 0.3, a: 150 },   // inner ring (collarette)
  detox: { r: 0.62, a: 110 },      // lower (6–8 o'clock)
  lymph: { r: 0.92, a: 195 },      // outer rim
}

const BAND_COLOR = {
  good: '#10b981',
  moderate: '#f59e0b',
  attention: '#fb7185',
}

const CX = 130
const CY = 130
const IRIS_R = 112

function point(r, aDeg) {
  const a = (aDeg * Math.PI) / 180
  return [CX + Math.cos(a) * IRIS_R * r, CY + Math.sin(a) * IRIS_R * r]
}

export default function IrisMap({ zones, title }) {
  return (
    <div className="iris-map">
      {title && <h4 className="eye-section-title">🗺️ {title}</h4>}
      <svg viewBox="0 0 260 260" className="iris-map__svg" role="img" aria-label="Iris map">
        <defs>
          <radialGradient id="irisBg" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#312e81" />
            <stop offset="0.45" stopColor="#6d28d9" />
            <stop offset="0.8" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#0e7490" />
          </radialGradient>
        </defs>

        {/* Iris body */}
        <circle cx={CX} cy={CY} r={IRIS_R} fill="url(#irisBg)" />

        {/* Radial fibers (decorative) */}
        {Array.from({ length: 48 }).map((_, i) => {
          const [x1, y1] = point(0.2, i * 7.5)
          const [x2, y2] = point(0.98, i * 7.5)
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          )
        })}

        {/* Collarette ring (digestive boundary) */}
        <circle cx={CX} cy={CY} r={IRIS_R * 0.34} fill="none"
          stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="3 4" />
        {/* Outer rim (lymphatic) */}
        <circle cx={CX} cy={CY} r={IRIS_R * 0.95} fill="none"
          stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

        {/* Pupil */}
        <circle cx={CX} cy={CY} r={IRIS_R * 0.2} fill="#0b0a1f" />
        <circle cx={CX - 4} cy={CY - 5} r={IRIS_R * 0.06} fill="rgba(255,255,255,0.35)" />

        {/* Zone markers */}
        {zones.map((z, i) => {
          const p = POS[z.key] || { r: 0.5, a: i * 60 }
          const [x, y] = point(p.r, p.a)
          const color = BAND_COLOR[z.band] || '#fff'
          return (
            <g key={z.key}>
              <circle cx={x} cy={y} r="13" fill={color} stroke="#fff" strokeWidth="2.5">
                <title>{z.label} — {z.status}</title>
              </circle>
              <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0b0a1f">
                {i + 1}
              </text>
            </g>
          )
        })}
      </svg>

      <ol className="iris-map__legend">
        {zones.map((z, i) => (
          <li key={z.key} className={`iris-map__legend-item is-${z.band}`}>
            <span className="iris-map__num">{i + 1}</span>
            <span className="iris-map__lz">{z.emoji} {z.label}</span>
            <span className="iris-map__clock">🕐 {z.iris.clock}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
