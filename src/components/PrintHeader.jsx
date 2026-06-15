import { useLang } from '../i18n/LanguageContext.jsx'
import BrandLogo from './BrandLogo.jsx'

// Header + footer that appear ONLY on the printed/PDF report (hidden on screen
// via .print-only in the stylesheet). Wraps the report with branding, a date
// and the full medical disclaimer.
export default function PrintHeader({ title }) {
  const { t } = useLang()
  const today = new Date().toLocaleDateString(t.lang === 'he' ? 'he-IL' : 'en-GB')

  return (
    <div className="print-only print-header">
      <div className="print-header__top">
        <div className="print-header__brand">
          <BrandLogo size={34} />
          <strong>{t.brand}</strong>
        </div>
        <span className="print-header__date">{t.blood.printedOn || t.eye.printedOn}: {today}</span>
      </div>
      <h1 className="print-header__title">{title}</h1>
    </div>
  )
}

// Disclaimer block printed at the bottom of the report.
export function PrintDisclaimer() {
  const { t } = useLang()
  return (
    <div className="print-only print-disclaimer">
      <strong>⚕️ {t.disclaimer.title}:</strong> {t.disclaimer.full}
    </div>
  )
}
