import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'
import BrandLogo from './BrandLogo.jsx'

export default function Navbar() {
  const { t, toggleLang } = useLang()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/blood', label: t.nav.blood },
    { to: '/eye', label: t.nav.eye },
    { to: '/nutrition', label: t.nav.nutrition },
    { to: '/articles', label: t.nav.articles },
  ]

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          <BrandLogo />
          <span className="navbar__brand-text">
            <strong>{t.brand}</strong>
            <small>{t.brandSub}</small>
          </span>
        </Link>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <button className="navbar__lang navbar__lang--mobile" onClick={toggleLang}>
            {t.langToggle}
          </button>
        </nav>

        <div className="navbar__actions">
          <button className="navbar__lang" onClick={toggleLang} aria-label="Toggle language">
            <span className="navbar__lang-globe">🌐</span>
            {t.langToggle}
          </button>
          <button
            className={`navbar__burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
