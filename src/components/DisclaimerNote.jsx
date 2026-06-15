import { useLang } from '../i18n/LanguageContext.jsx'

// Inline medical disclaimer used at the top of the tool pages.
export default function DisclaimerNote({ extra }) {
  const { t } = useLang()
  return (
    <div className="disclaimer-note" role="note">
      <span className="disclaimer-note__icon">⚕️</span>
      <p>
        <strong>{t.disclaimer.title}.</strong> {t.disclaimer.short}
        {extra ? <> <span className="disclaimer-note__extra">{extra}</span></> : null}
      </p>
    </div>
  )
}
