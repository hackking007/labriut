import { useLang } from '../i18n/LanguageContext.jsx'

// Thin announcement strip above the navbar crediting the app's creator.
export default function CreditBar() {
  const { t } = useLang()
  return (
    <div className="credit-bar">
      <div className="container">{t.credit}</div>
    </div>
  )
}
