// Decorative inline SVG "human body systems" illustration for the hero.
// Pure SVG so there are no external image dependencies.
// Purple + cyan (תכלת) medical palette with a glowing, anatomical look.
export default function AnatomyIllustration() {
  return (
    <svg viewBox="0 0 300 400" className="anatomy" role="img" aria-label="Human body systems">
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ede9fe" />
          <stop offset="0.5" stopColor="#e0f7ff" />
          <stop offset="1" stopColor="#ddd6fe" />
        </linearGradient>
        <linearGradient id="bodyStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="38%" r="62%">
          <stop offset="0" stopColor="#7c3aed" stopOpacity="0.22" />
          <stop offset="0.6" stopColor="#22d3ee" stopOpacity="0.12" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="organGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      <circle cx="150" cy="180" r="168" fill="url(#glow)" />

      {/* Body silhouette */}
      <g className="anatomy__body">
        {/* head */}
        <circle cx="150" cy="56" r="30" fill="url(#bodyGrad)" stroke="url(#bodyStroke)" strokeWidth="2.5" />
        {/* neck */}
        <path d="M138 82 h24 v14 h-24 z" fill="url(#bodyGrad)" stroke="url(#bodyStroke)" strokeWidth="2" />
        {/* torso */}
        <path
          d="M112 98 Q150 88 188 98 L196 158 Q198 212 184 262 L176 348 Q150 358 124 348 L116 262 Q102 212 104 158 Z"
          fill="url(#bodyGrad)"
          stroke="url(#bodyStroke)"
          strokeWidth="2.5"
        />
        {/* arms */}
        <path d="M114 104 Q84 158 80 232" fill="none" stroke="url(#bodyStroke)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M186 104 Q216 158 220 232" fill="none" stroke="url(#bodyStroke)" strokeWidth="2.5" strokeLinecap="round" />
        {/* legs hint */}
        <path d="M138 350 L132 392" fill="none" stroke="url(#bodyStroke)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M162 350 L168 392" fill="none" stroke="url(#bodyStroke)" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Brain (nervous) */}
      <g className="anatomy__pulse">
        <circle cx="150" cy="52" r="13" fill="url(#organGlow)" />
        <text x="150" y="57" textAnchor="middle" fontSize="13">🧠</text>
      </g>

      {/* Lungs (respiratory) */}
      <text x="126" y="150" textAnchor="middle" fontSize="17" opacity="0.92">🫁</text>
      <text x="174" y="150" textAnchor="middle" fontSize="17" opacity="0.92">🫁</text>

      {/* Heart (cardio) */}
      <text x="150" y="148" textAnchor="middle" fontSize="22" className="anatomy__heart">🫀</text>

      {/* Digestive */}
      <text x="150" y="212" textAnchor="middle" fontSize="18" opacity="0.9">🌀</text>

      {/* Kidneys (detox) */}
      <circle cx="132" cy="232" r="4.5" fill="#7c3aed" opacity="0.7" />
      <circle cx="168" cy="232" r="4.5" fill="#7c3aed" opacity="0.7" />

      {/* Connective glow dots along the spine */}
      <g className="anatomy__pulse" opacity="0.55">
        <circle cx="150" cy="120" r="2.5" fill="#22d3ee" />
        <circle cx="150" cy="180" r="2.5" fill="#22d3ee" />
        <circle cx="150" cy="250" r="2.5" fill="#22d3ee" />
      </g>

      {/* Heartbeat / ECG line */}
      <path
        d="M30 318 H92 l9 -24 14 48 12 -34 8 10 H270"
        fill="none"
        stroke="url(#bodyStroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="anatomy__ecg"
      />
    </svg>
  )
}
