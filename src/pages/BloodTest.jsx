import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import DisclaimerNote from '../components/DisclaimerNote.jsx'
import PrintHeader, { PrintDisclaimer } from '../components/PrintHeader.jsx'
import {
  BLOOD_MARKERS,
  SAMPLE_VALUES,
  analyzeBloodTest,
  buildMealPlan,
} from '../logic/bloodAnalysis.js'

export default function BloodTest() {
  const { t, lang } = useLang()
  const [values, setValues] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function setVal(key, v) {
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  function fillSample() {
    setValues({ ...SAMPLE_VALUES })
  }

  function runAnalysis() {
    setLoading(true)
    setResult(null)
    // Simulate the agent "thinking". Swap this timeout for a real API call later.
    setTimeout(() => {
      const r = analyzeBloodTest(values, lang)
      setResult(r)
      setLoading(false)
      // Persist abnormal markers so the nutrition calculator can cross-reference
      // them (e.g. high sodium / glucose → alerts on what you ate).
      try {
        const flags = {}
        r.markers.forEach((m) => { if (m.status && m.status !== 'normal') flags[m.key] = m.status })
        localStorage.setItem('labriut:bloodFlags', JSON.stringify({ flags, at: Date.now() }))
      } catch { /* ignore storage errors */ }
    }, 1300)
  }

  function reset() {
    setValues({})
    setResult(null)
  }

  return (
    <div className="page">
      <div className="page__hero page__hero--blood">
        <div className="container">
          <span className="page__tag">🩸 {t.common.demoTag}</span>
          <h1>{t.blood.title}</h1>
          <p>{t.blood.subtitle}</p>
        </div>
      </div>

      <div className="container page__body">
        <DisclaimerNote />

        <div className="tool-grid">
          {/* INPUT SIDE */}
          <section className="tool-panel">
            <h2 className="tool-panel__title">{t.blood.manualTitle}</h2>
            <p className="tool-note">{t.blood.manualHint}</p>

            <div className="marker-inputs">
              {BLOOD_MARKERS.map((m) => (
                <label key={m.key} className="marker-input">
                  <span className="marker-input__label">{t.blood.fields[m.key]}</span>
                  <span className="marker-input__field">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      placeholder={t.blood.placeholder}
                      value={values[m.key] ?? ''}
                      onChange={(e) => setVal(m.key, e.target.value)}
                    />
                    <em>{t.blood.units[m.key]}</em>
                  </span>
                  <span className="marker-input__range">
                    {t.blood.normalRange}: {m.min}–{m.max}
                  </span>
                </label>
              ))}
            </div>

            <div className="tool-actions">
              <button className="btn btn--outline" onClick={fillSample} type="button">
                ✨ {t.blood.demoFill}
              </button>
              <button
                className="btn btn--primary"
                onClick={runAnalysis}
                disabled={loading}
                type="button"
              >
                {loading ? t.blood.analyzing : t.blood.analyze}
              </button>
            </div>
          </section>

          {/* RESULTS SIDE */}
          <section className="tool-panel tool-panel--result print-area">
            <PrintHeader title={t.blood.reportTitle} />
            <h2 className="tool-panel__title no-print">{t.blood.resultsTitle}</h2>

            {loading && <AgentThinking label={t.blood.analyzing} />}

            {!loading && !result && (
              <div className="result-empty">
                <div className="result-empty__icon">🩺</div>
                <p>{lang === 'he'
                  ? 'הזינו ערכים והפעילו את הניתוח כדי לראות תוצאות כאן.'
                  : 'Enter values and run the analysis to see results here.'}</p>
              </div>
            )}

            {!loading && result && (
              <BloodResult result={result} />
            )}

            {result && <PrintDisclaimer />}

            {result && (
              <div className="result-actions no-print">
                <button className="btn btn--primary btn--block" onClick={() => window.print()} type="button">
                  🖨️ {t.blood.download}
                </button>
                <button className="btn btn--ghost btn--block" onClick={reset} type="button">
                  ↻ {t.blood.reset}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function AgentThinking({ label }) {
  return (
    <div className="agent-thinking">
      <div className="agent-thinking__avatar">🤖</div>
      <div className="agent-thinking__dots">
        <span /><span /><span />
      </div>
      <p>{label}</p>
    </div>
  )
}

function BloodResult({ result }) {
  const { t, lang } = useLang()
  const { markers, summary, recommendations } = result
  const [plan, setPlan] = useState(null)
  const [buildingPlan, setBuildingPlan] = useState(false)
  const hasAbnormal = result.abnormalCount > 0

  function buildPlan() {
    setBuildingPlan(true)
    // Simulate the agent "cooking up" the menu (swap for a real API call later).
    setTimeout(() => {
      setPlan(buildMealPlan(markers, lang))
      setBuildingPlan(false)
    }, 900)
  }

  return (
    <div className="blood-result">
      <div className={`agent-summary ${result.abnormalCount === 0 ? 'is-good' : 'is-warn'}`}>
        <div className="agent-summary__avatar">🤖</div>
        <div>
          <h3>{t.blood.summaryTitle}</h3>
          <p>{summary}</p>
        </div>
      </div>

      {markers.length > 0 && (
        <ul className="marker-results">
          {markers.map((m) => (
            <li key={m.key} className={`marker-result is-${m.status}`}>
              <div className="marker-result__top">
                <span className="marker-result__name">{t.blood.fields[m.key]}</span>
                <span className={`badge badge--${m.status}`}>
                  {t.blood.status[m.status]}
                </span>
              </div>
              <div className="marker-result__bar">
                <RangeBar value={m.value} min={m.min} max={m.max} status={m.status} />
              </div>
              <div className="marker-result__meta">
                <span>{t.blood.yourValue}: <strong>{m.value} {t.blood.units[m.key]}</strong></span>
                <span>{t.blood.normalRange}: {m.min}–{m.max}</span>
              </div>
              {m.note && <p className="marker-result__note">💡 {m.note}</p>}
            </li>
          ))}
        </ul>
      )}

      {recommendations?.length > 0 && (
        <div className="recommendations">
          <h3>✅ {t.blood.recommendationsTitle}</h3>
          <ul>
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Personalized menu — offered when something is out of range. */}
      {hasAbnormal && !plan && (
        <div className="menu-cta no-print">
          <button
            className="btn btn--primary btn--block"
            onClick={buildPlan}
            disabled={buildingPlan}
            type="button"
          >
            {buildingPlan ? t.blood.menu.building : t.blood.menu.cta}
          </button>
        </div>
      )}

      {plan && <MealPlan plan={plan} />}
    </div>
  )
}

function MealPlan({ plan }) {
  const { t } = useLang()
  const m = t.blood.menu

  return (
    <div className="meal-plan">
      <div className="meal-plan__head">
        <h3>🍽️ {m.title}</h3>
        <p>{m.intro}</p>
        {plan.conditions.length > 0 && (
          <p className="meal-plan__for">
            <strong>{m.forConditions}:</strong> {plan.conditions.join(' · ')}
          </p>
        )}
      </div>

      <div className="meal-plan__lists">
        <div className="meal-plan__col meal-plan__col--favor">
          <h4>✅ {m.favor}</h4>
          <ul>
            {plan.favor.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        {plan.avoid.length > 0 && (
          <div className="meal-plan__col meal-plan__col--avoid">
            <h4>🚫 {m.avoid}</h4>
            <ul>
              {plan.avoid.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="meal-plan__day">
        <h4>📅 {m.dayTitle}</h4>
        <div className="meal-plan__meals">
          <MealRow icon="🌅" label={m.breakfast} text={plan.day.breakfast} />
          <MealRow icon="🍲" label={m.lunch} text={plan.day.lunch} />
          <MealRow icon="🌙" label={m.dinner} text={plan.day.dinner} />
          <MealRow icon="🍎" label={m.snack} text={plan.day.snack} />
        </div>
      </div>

      {plan.tips.length > 0 && (
        <div className="meal-plan__tips">
          <h4>💡 {m.tips}</h4>
          <ul>
            {plan.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}

      <p className="meal-plan__note">⚕️ {m.disclaimer}</p>
    </div>
  )
}

function MealRow({ icon, label, text }) {
  return (
    <div className="meal-row">
      <span className="meal-row__icon">{icon}</span>
      <div className="meal-row__body">
        <span className="meal-row__label">{label}</span>
        <span className="meal-row__text">{text}</span>
      </div>
    </div>
  )
}

// Visual range bar: shows where the value falls vs the normal range.
function RangeBar({ value, min, max, status }) {
  // Build a display scale a bit wider than the normal range.
  const span = max - min || 1
  const lo = min - span * 0.6
  const hi = max + span * 0.6
  const clamp = (n) => Math.max(0, Math.min(100, n))
  const pct = (n) => clamp(((n - lo) / (hi - lo)) * 100)

  return (
    <div className="range-bar">
      <div
        className="range-bar__normal"
        style={{ insetInlineStart: `${pct(min)}%`, width: `${pct(max) - pct(min)}%` }}
      />
      <div
        className={`range-bar__marker is-${status}`}
        style={{ insetInlineStart: `${pct(value)}%` }}
      />
    </div>
  )
}
