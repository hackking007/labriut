import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import DisclaimerNote from '../components/DisclaimerNote.jsx'
import UploadZone from '../components/UploadZone.jsx'
import PrintHeader, { PrintDisclaimer } from '../components/PrintHeader.jsx'
import TrendGraph from '../components/TrendGraph.jsx'
import {
  parseFoods,
  estimateFromPhoto,
  analyzeDay,
} from '../logic/nutritionAnalysis.js'

const HISTORY_KEY = 'labriut:nutriHistory'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] } catch { return [] }
}

// Save (or replace) today's entry, keep the last 14 days sorted by date.
function saveToHistory(result) {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const label = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`
  const entry = {
    date,
    label,
    kcal: result.totals.kcal,
    sodium: result.totals.sodium,
    sugar: result.totals.sugar,
    target: result.targets ? result.targets.tdee : 0,
  }
  const rest = loadHistory().filter((e) => e.date !== date)
  const next = [...rest, entry].sort((a, b) => a.date.localeCompare(b.date)).slice(-14)
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  return next
}

const SAMPLE_FOOD_HE = `2 פרוסות לחם\nביצה\nגבינה צהובה\nסלט ירקות\nחזה עוף\nאורז\nשוקולד\nמשקה ממותק`
const SAMPLE_FOOD_EN = `2 slices of bread\negg\nyellow cheese\nsalad\nchicken breast\nrice\nchocolate\nsweet drink`

export default function NutritionCalc() {
  const { t, lang } = useLang()
  const n = t.nutrition

  const [profile, setProfile] = useState({ sex: 'female', age: '', height: '', weight: '', activity: 'medium' })
  const [foodText, setFoodText] = useState('')
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [unmatched, setUnmatched] = useState([])
  const [loading, setLoading] = useState(false)
  const [bloodFlags, setBloodFlags] = useState(null)
  const [history, setHistory] = useState([])

  // Pull the last blood test flags (saved by the blood test page) + history.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('labriut:bloodFlags')
      if (raw) setBloodFlags(JSON.parse(raw).flags || null)
    } catch { /* ignore */ }
    setHistory(loadHistory())
  }, [])

  function setP(key, v) {
    setProfile((prev) => ({ ...prev, [key]: v }))
  }

  function fillSample() {
    setProfile({ sex: 'female', age: '30', height: '165', weight: '68', activity: 'medium' })
    setFoodText(lang === 'en' ? SAMPLE_FOOD_EN : SAMPLE_FOOD_HE)
  }

  function calculate() {
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      // Combine typed items + (demo) photo-detected items.
      const parsed = parseFoods(foodText, lang)
      const photoItems = file ? estimateFromPhoto({ name: file.name, size: file.size }, lang) : []
      const items = [...parsed.items, ...photoItems]
      const flags = bloodFlags || {}
      const r = analyzeDay(items, profile, flags, lang)
      setResult(r)
      setUnmatched(parsed.unmatched)
      if (items.length > 0) setHistory(saveToHistory(r))
      setLoading(false)
    }, 1200)
  }

  function reset() {
    setProfile({ sex: 'female', age: '', height: '', weight: '', activity: 'medium' })
    setFoodText('')
    setFile(null)
    setResult(null)
    setUnmatched([])
  }

  function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY) } catch { /* ignore */ }
    setHistory([])
  }

  return (
    <div className="page">
      <div className="page__hero page__hero--nutri">
        <div className="container">
          <span className="page__tag">🍎 {t.common.demoTag}</span>
          <h1>{n.title}</h1>
          <p>{n.subtitle}</p>
        </div>
      </div>

      <div className="container page__body">
        <DisclaimerNote />

        <div className="tool-grid">
          {/* INPUT */}
          <section className="tool-panel">
            <h2 className="tool-panel__title">{n.profileTitle}</h2>

            {/* Sex */}
            <div className="seg">
              <button
                type="button"
                className={`seg__btn ${profile.sex === 'female' ? 'is-active' : ''}`}
                onClick={() => setP('sex', 'female')}
              >👩 {n.female}</button>
              <button
                type="button"
                className={`seg__btn ${profile.sex === 'male' ? 'is-active' : ''}`}
                onClick={() => setP('sex', 'male')}
              >👨 {n.male}</button>
            </div>

            <div className="profile-grid">
              <label className="marker-input">
                <span className="marker-input__label">{n.age}</span>
                <span className="marker-input__field">
                  <input type="number" inputMode="numeric" value={profile.age}
                    onChange={(e) => setP('age', e.target.value)} placeholder="30" />
                  <em>{n.years}</em>
                </span>
              </label>
              <label className="marker-input">
                <span className="marker-input__label">{n.height}</span>
                <span className="marker-input__field">
                  <input type="number" inputMode="numeric" value={profile.height}
                    onChange={(e) => setP('height', e.target.value)} placeholder="165" />
                  <em>cm</em>
                </span>
              </label>
              <label className="marker-input">
                <span className="marker-input__label">{n.weight}</span>
                <span className="marker-input__field">
                  <input type="number" inputMode="numeric" value={profile.weight}
                    onChange={(e) => setP('weight', e.target.value)} placeholder="68" />
                  <em>kg</em>
                </span>
              </label>
              <label className="marker-input">
                <span className="marker-input__label">{n.activity}</span>
                <span className="marker-input__field">
                  <select value={profile.activity} onChange={(e) => setP('activity', e.target.value)}>
                    <option value="low">{n.activityLow}</option>
                    <option value="medium">{n.activityMedium}</option>
                    <option value="high">{n.activityHigh}</option>
                  </select>
                </span>
              </label>
            </div>

            <div className="divider"><span>{n.foodTitle}</span></div>

            <p className="tool-note">{n.foodHint}</p>
            <textarea
              className="food-input"
              rows={6}
              value={foodText}
              onChange={(e) => setFoodText(e.target.value)}
              placeholder={n.foodPlaceholder}
            />

            <div className="divider"><span>{n.orPhoto}</span></div>
            <UploadZone
              icon="📸"
              hint={n.photoHint}
              accept="image/*"
              file={file}
              onFile={setFile}
            />
            <p className="tool-note">🔒 {n.photoNote}</p>

            <div className="bloodlink">
              {bloodFlags && Object.keys(bloodFlags).length > 0
                ? <span className="bloodlink__on">🔗 {n.bloodLinked}</span>
                : <span className="bloodlink__off">🔗 {n.bloodNotLinked}</span>}
            </div>

            <div className="tool-actions">
              <button className="btn btn--outline" onClick={fillSample} type="button">✨ {n.demoFill}</button>
              <button className="btn btn--primary" onClick={calculate} disabled={loading} type="button">
                {loading ? n.calculating : `🧮 ${n.calculate}`}
              </button>
            </div>
          </section>

          {/* RESULTS */}
          <section className="tool-panel tool-panel--result print-area">
            <PrintHeader title={n.title} />
            <h2 className="tool-panel__title no-print">{n.resultsTitle}</h2>

            {loading && (
              <div className="agent-thinking">
                <div className="agent-thinking__avatar">🤖</div>
                <div className="agent-thinking__dots"><span /><span /><span /></div>
                <p>{n.calculating}</p>
              </div>
            )}

            {!loading && !result && (
              <div className="result-empty">
                <div className="result-empty__icon">🍽️</div>
                <p>{n.emptyHint}</p>
              </div>
            )}

            {!loading && result && (
              <NutritionResult result={result} unmatched={unmatched} n={n} />
            )}

            {history.length > 0 && (
              <NutritionHistory history={history} n={n} onClear={clearHistory} />
            )}

            {result && <PrintDisclaimer />}

            {result && (
              <div className="result-actions no-print">
                <button className="btn btn--primary btn--block" onClick={() => window.print()} type="button">
                  🖨️ {n.download}
                </button>
                <button className="btn btn--ghost btn--block" onClick={reset} type="button">↻ {n.reset}</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function NutritionResult({ result, unmatched, n }) {
  const { totals, balance, macroPct, alerts } = result

  return (
    <div className="nutri-result">
      {/* Alerts first — most important */}
      {alerts.length > 0 && (
        <div className="nutri-alerts">
          {alerts.map((a, i) => (
            <div key={i} className={`nutri-alert is-${a.severity}`}>
              <span className="nutri-alert__icon">{a.icon}</span>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Calorie balance vs target */}
      {balance && (
        <div className={`nutri-balance is-${balance.status}`}>
          <div className="nutri-balance__head">
            <div className="nutri-balance__big">
              <strong>{totals.kcal}</strong>
              <span>{n.totalKcal}</span>
            </div>
            <div className="nutri-balance__target">
              <span>{n.tdee}: <strong>{balance.tdee}</strong> {n.kcal}</span>
              <span className="nutri-balance__bmr">{n.bmr}: {balance.bmr} {n.kcal}</span>
            </div>
          </div>
          <p className="nutri-balance__verdict">
            {balance.status === 'deficit' && n.deficitText(balance.weeklyKg)}
            {balance.status === 'surplus' && n.surplusText(balance.weeklyKg)}
            {balance.status === 'balanced' && n.balancedText}
          </p>
        </div>
      )}

      {!balance && (
        <div className="nutri-alert is-warn">
          <span className="nutri-alert__icon">📋</span>
          <p>{n.fillProfile} ({n.totalKcal}: {totals.kcal} {n.kcal})</p>
        </div>
      )}

      {/* Macro breakdown */}
      <div className="nutri-macros">
        <h3>📊 {n.macros}</h3>
        <div className="macro-bar">
          <span className="macro-bar__seg is-p" style={{ width: `${macroPct.protein}%` }} />
          <span className="macro-bar__seg is-c" style={{ width: `${macroPct.carbs}%` }} />
          <span className="macro-bar__seg is-f" style={{ width: `${macroPct.fat}%` }} />
        </div>
        <div className="macro-legend">
          <MacroStat color="is-p" label={n.protein} grams={totals.protein} pct={macroPct.protein} />
          <MacroStat color="is-c" label={n.carbs} grams={totals.carbs} pct={macroPct.carbs} />
          <MacroStat color="is-f" label={n.fat} grams={totals.fat} pct={macroPct.fat} />
        </div>
        <div className="nutri-micros">
          <div className="micro"><span>🧂 {n.sodium}</span><strong>{totals.sodium} mg</strong></div>
          <div className="micro"><span>🍬 {n.sugar}</span><strong>{totals.sugar} g</strong></div>
        </div>
      </div>

      {unmatched.length > 0 && (
        <p className="nutri-unmatched">⚠️ {n.unmatched}: {unmatched.join(', ')}</p>
      )}
    </div>
  )
}

function MacroStat({ color, label, grams, pct }) {
  return (
    <div className="macro-stat">
      <span className={`macro-dot ${color}`} />
      <span className="macro-stat__label">{label}</span>
      <strong>{grams}g</strong>
      <small>{pct}%</small>
    </div>
  )
}

function NutritionHistory({ history, n, onClear }) {
  const h = n.history
  const [metric, setMetric] = useState('kcal')

  // Per-metric chart config (target = recommended limit / maintenance).
  const lastTarget = history[history.length - 1]?.target || 0
  const METRICS = {
    kcal: { label: h.caloriesLabel, valueKey: 'kcal', target: lastTarget, unit: n.kcal },
    sodium: { label: n.sodium, valueKey: 'sodium', target: 2300, unit: 'mg' },
    sugar: { label: n.sugar, valueKey: 'sugar', target: 50, unit: 'g' },
  }
  const m = METRICS[metric]
  const avg = Math.round(history.reduce((s, e) => s + (e[m.valueKey] || 0), 0) / history.length)

  return (
    <div className="nutri-history">
      <div className="nutri-history__head">
        <h3>📈 {h.title}</h3>
        <button className="nutri-history__clear no-print" onClick={onClear} type="button">
          🗑️ {h.clear}
        </button>
      </div>

      <div className="metric-toggle no-print">
        {Object.entries(METRICS).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            className={`metric-toggle__btn ${metric === key ? 'is-active' : ''}`}
            onClick={() => setMetric(key)}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <TrendGraph
        data={history}
        valueKey={m.valueKey}
        target={m.target}
        unitLabel={m.unit}
        targetLabel={h.targetLabel}
      />

      <div className="nutri-history__foot">
        <span>{h.days(history.length)}</span>
        <span>{h.avg}: <strong>{avg}</strong> {m.unit}</span>
      </div>
    </div>
  )
}
