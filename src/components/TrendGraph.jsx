// Simple, dependency-free SVG bar chart for a daily nutrition trend.
// Generic over the metric: reads data[i][valueKey] and compares each
// day to `target` (a recommended limit / maintenance value). Bars
// under the target are cyan, over are amber, with a dashed target line.
export default function TrendGraph({ data, valueKey = 'kcal', target = 0, unitLabel, targetLabel, accent = '#06b6d4' }) {
  if (!data || data.length === 0) return null

  const W = 320
  const H = 170
  const padX = 8
  const padTop = 14
  const padBottom = 24
  const plotH = H - padTop - padBottom
  const plotW = W - padX * 2

  const valueOf = (d) => d[valueKey] || 0

  // Scale: include target so the reference line always fits.
  const maxVal = Math.max(...data.map(valueOf), target) * 1.12 || 1
  const y = (v) => padTop + plotH - (v / maxVal) * plotH

  const n = data.length
  const slot = plotW / n
  const barW = Math.min(26, slot * 0.6)
  const labelEvery = n > 8 ? 2 : 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend" role="img" aria-label="Nutrition trend">
      {/* Target reference line */}
      {target > 0 && (
        <>
          <line x1={padX} y1={y(target)} x2={W - padX} y2={y(target)}
            stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x={W - padX} y={y(target) - 4} textAnchor="end"
            fontSize="9" fill="#6d28d9">{targetLabel} {target}</text>
        </>
      )}

      {data.map((d, i) => {
        const val = valueOf(d)
        const cx = padX + slot * i + slot / 2
        const top = y(val)
        const h = padTop + plotH - top
        const over = target > 0 && val > target
        const color = over ? '#f59e0b' : accent
        return (
          <g key={d.date}>
            <rect
              x={cx - barW / 2} y={top} width={barW} height={Math.max(2, h)}
              rx="4" fill={color}
            >
              <title>{d.label}: {val} {unitLabel}</title>
            </rect>
            <text x={cx} y={top - 4} textAnchor="middle" fontSize="8.5"
              fill="#6a6593" fontWeight="700">{val}</text>
            {i % labelEvery === 0 && (
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="9" fill="#a6a3c4">
                {d.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
