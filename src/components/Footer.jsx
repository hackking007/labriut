import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'
import BrandLogo from './BrandLogo.jsx'

export default function Footer() {
  const { t } = useLang()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__brand-top">
            <BrandLogo size={36} />
            <strong>{t.brand}</strong>
          </div>
          <p>{t.footer.tagline}</p>
          <span className="footer__demo">{t.footer.builtWith}</span>
        </div>

        <div className="footer__col">
          <h4>{t.footer.sections.explore}</h4>
          <Link to="/">{t.nav.home}</Link>
          <Link to="/blood">{t.nav.blood}</Link>
          <Link to="/eye">{t.nav.eye}</Link>
          <Link to="/articles">{t.nav.articles}</Link>
        </div>

        <div className="footer__col">
          <h4>{t.footer.sections.legal}</h4>
          <a href="#">{t.footer.privacy}</a>
          <a href="#">{t.footer.terms}</a>
          <span className="footer__emergency">🚑 {t.common.emergency}</span>
        </div>
      </div>

      <div className="footer__disclaimer">
        <div className="container">
          <strong>⚕️ {t.disclaimer.title}:</strong> {t.disclaimer.full}
        </div>
      </div>

      <div className="footer__bar">
        <div className="container">
          © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
        </div>
      </div>
    </footer>
  )
}
