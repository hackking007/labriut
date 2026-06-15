import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import DisclaimerNote from '../components/DisclaimerNote.jsx'
import UploadZone from '../components/UploadZone.jsx'
import PrintHeader, { PrintDisclaimer } from '../components/PrintHeader.jsx'
import IrisMap from '../components/IrisMap.jsx'
import { analyzeEye } from '../logic/eyeAnalysis.js'

export default function EyeDiagnosis() {
  const { t, lang } = useLang()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Build/revoke an object URL for the image preview.
  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function runAnalysis() {
    if (!file) return
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      setResult(analyzeEye({ name: file.name, size: file.size }, lang))
      setLoading(false)
    }, 1500)
  }

  function reset() {
    setFile(null)
    setResult(null)
  }

  return (
    <div className="page">
      <div className="page__hero page__hero--eye">
        <div className="container">
          <span className="page__tag">👁️ {t.common.demoTag}</span>
          <h1>{t.eye.title}</h1>
          <p>{t.eye.subtitle}</p>
        </div>
      </div>

      <div className="container page__body">
        <DisclaimerNote extra={t.eye.pseudoWarning} />

        <div className="tool-grid">
          {/* INPUT */}
          <section className="tool-panel">
            <h2 className="tool-panel__title">{t.eye.uploadTitle}</h2>
            <UploadZone
              icon="👁️"
              hint={t.eye.uploadHint}
              accept="image/*"
              file={file}
              preview={preview}
              onFile={setFile}
            />

            <div className="eye-guide">
              <span>💡</span>
              <p>{lang === 'he'
                ? 'לתוצאה טובה: תמונה חדה, תאורה טובה, והעין ממלאת את רוב הפריים.'
                : 'For a good result: a sharp photo, good lighting, and the eye filling most of the frame.'}</p>
            </div>

            <div className="tool-actions">
              <button
                className="btn btn--primary btn--block"
                onClick={runAnalysis}
                disabled={!file || loading}
                type="button"
              >
                {loading ? t.eye.analyzing : `👁️ ${t.eye.analyze}`}
              </button>
            </div>
          </section>

          {/* RESULTS */}
          <section className="tool-panel tool-panel--result print-area">
            <PrintHeader title={t.eye.reportTitle} />
            <h2 className="tool-panel__title no-print">{t.eye.resultsTitle}</h2>

            {loading && (
              <div className="eye-scanning">
                <div className="eye-scanning__iris">
                  <div className="eye-scanning__pupil" />
                  <div className="eye-scanning__ring" />
                </div>
                <p>{t.eye.analyzing}</p>
              </div>
            )}

            {!loading && !result && (
              <div className="result-empty">
                <div className="result-empty__icon">👁️</div>
                <p>{lang === 'he'
                  ? 'העלו תמונת עין והפעילו את האבחון.'
                  : 'Upload an eye photo and run the analysis.'}</p>
              </div>
            )}

            {!loading && result && (
              <div className="eye-result">
                <div className="agent-summary is-warn">
                  <div className="agent-summary__avatar">🤖</div>
                  <div>
                    <h3>{t.eye.zonesTitle}</h3>
                    <p>{t.eye.pseudoWarning}</p>
                  </div>
                </div>

                <h4 className="eye-section-title">{t.eye.zonesTitle}</h4>
                <ul className="eye-zones">
                  {result.zones.map((z) => (
                    <li key={z.key} className="eye-zone">
                      <span className="eye-zone__emoji">{z.emoji}</span>
                      <span className="eye-zone__label">{z.label}</span>
                      <span className="eye-zone__bar">
                        <span
                          className={`eye-zone__fill is-${z.band}`}
                          style={{ width: `${z.score}%` }}
                          data-score={z.score}
                        />
                      </span>
                      <span className="eye-zone__score">{z.score}%</span>
                    </li>
                  ))}
                </ul>

                {/* Iris topography map — where each finding sits on the eye */}
                <IrisMap zones={result.zones} title={t.eye.deep.mapTitle} />

                {/* Per-organ explanation of what the eye analysis means */}
                <div className="eye-details">
                  <h4 className="eye-section-title">🔬 {t.eye.detailsTitle}</h4>
                  <div className="eye-details__list">
                    {result.zones.map((z) => (
                      <div key={z.key} className={`organ-card is-${z.band}`}>
                        <div className="organ-card__head">
                          <span className="organ-card__emoji">{z.emoji}</span>
                          <div className="organ-card__titles">
                            <strong>{z.label}</strong>
                            <small>{t.eye.relatedOrgans}: {z.organs}</small>
                          </div>
                          <span className={`badge badge--band-${z.band}`}>{z.status}</span>
                        </div>
                        <p className="organ-card__text">{z.detail}</p>

                        {/* Deep "which part of the eye" layer */}
                        <div className="iris-detail">
                          <div className="iris-detail__loc">
                            <span className="iris-detail__chip">📍 {z.iris.area}</span>
                            <span className="iris-detail__chip">🕐 {z.iris.clock}</span>
                            <span className="iris-detail__chip iris-detail__chip--sign">🔬 {z.iris.sign}</span>
                          </div>
                          <p className="iris-detail__row">
                            <strong>{t.eye.deep.observationLabel}:</strong> {z.iris.observation}
                          </p>
                          <p className="iris-detail__row iris-detail__row--why">
                            <strong>{t.eye.deep.whyLabel}:</strong> {z.iris.why}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recommendations">
                  <h3>💬 {t.eye.resultsTitle}</h3>
                  <ul>
                    {result.insights.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>

                {/* Overall summary that combines all zones into one read */}
                <div className={`eye-overall is-${result.overall.level}`}>
                  <div className="eye-overall__head">
                    <div className="eye-overall__gauge">
                      <strong>{result.overall.score}%</strong>
                      <small>{t.eye.overallScore}</small>
                    </div>
                    <div className="eye-overall__title">
                      <span className="eye-overall__tag">📋 {t.eye.overallTitle}</span>
                      <h3>{result.overall.headline}</h3>
                    </div>
                  </div>
                  <p className="eye-overall__text">{result.overall.text}</p>
                  {result.overall.focusAreas.length > 0 && (
                    <div className="eye-overall__focus">
                      <span className="eye-overall__focus-label">🎯 {t.eye.focusTitle}:</span>
                      {result.overall.focusAreas.map((f) => (
                        <span key={f} className="chip">{f}</span>
                      ))}
                    </div>
                  )}
                </div>

                <PrintDisclaimer />

                <div className="result-actions no-print">
                  <button className="btn btn--primary btn--block" onClick={() => window.print()} type="button">
                    🖨️ {t.eye.download}
                  </button>
                  <button className="btn btn--ghost btn--block" onClick={reset} type="button">
                    ↻ {t.eye.reset}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
