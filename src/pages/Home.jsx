import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'
import AnatomyIllustration from '../components/AnatomyIllustration.jsx'
import BodySystems from '../components/BodySystems.jsx'
import ArticlesGrid from '../components/ArticlesGrid.jsx'

export default function Home() {
  const { t } = useLang()

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="hero__badge">{t.hero.badge}</span>
            <h1 className="hero__title">
              {t.hero.title}{' '}
              <span className="hero__accent">{t.hero.titleAccent}</span>
            </h1>
            <p className="hero__subtitle">{t.hero.subtitle}</p>

            <div className="hero__cta">
              <Link to="/blood" className="btn btn--primary btn--lg">
                🩸 {t.hero.ctaBlood}
              </Link>
              <Link to="/eye" className="btn btn--ghost btn--lg">
                👁️ {t.hero.ctaEye}
              </Link>
            </div>

            <div className="hero__stats">
              <div><strong>6+</strong><span>{t.hero.stat1}</span></div>
              <div><strong>6</strong><span>{t.hero.stat2}</span></div>
              <div><strong>24/7</strong><span>{t.hero.stat3}</span></div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__visual-card">
              <AnatomyIllustration />
            </div>
            <div className="hero__floating hero__floating--1">🩸 CBC</div>
            <div className="hero__floating hero__floating--2">👁️ Iris</div>
            <div className="hero__floating hero__floating--3">💚 Vitamin D</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <header className="section__head">
            <h2>{t.features.title}</h2>
            <p>{t.features.subtitle}</p>
          </header>

          <div className="features__grid">
            <FeatureCard
              icon="🩸"
              accent="card--blood"
              title={t.features.blood.title}
              desc={t.features.blood.desc}
              to="/blood"
              cta={t.features.blood.cta}
            />
            <FeatureCard
              icon="👁️"
              accent="card--eye"
              title={t.features.eye.title}
              desc={t.features.eye.desc}
              to="/eye"
              cta={t.features.eye.cta}
            />
            <FeatureCard
              icon="🍎"
              accent="card--nutri"
              title={t.features.nutrition.title}
              desc={t.features.nutrition.desc}
              to="/nutrition"
              cta={t.features.nutrition.cta}
            />
            <FeatureCard
              icon="📚"
              accent="card--articles"
              title={t.features.articles.title}
              desc={t.features.articles.desc}
              to="/articles"
              cta={t.features.articles.cta}
            />
          </div>
        </div>
      </section>

      {/* BODY SYSTEMS */}
      <BodySystems />

      {/* ARTICLES PREVIEW */}
      <section className="section section--alt">
        <div className="container">
          <header className="section__head">
            <h2>{t.articles.title}</h2>
            <p>{t.articles.subtitle}</p>
          </header>
          <ArticlesGrid limit={3} />
          <div className="section__more">
            <Link to="/articles" className="btn btn--outline">
              {t.nav.articles} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc, to, cta, accent }) {
  return (
    <Link to={to} className={`feature-card ${accent}`}>
      <div className="feature-card__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className="feature-card__cta">{cta} →</span>
    </Link>
  )
}
