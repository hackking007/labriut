import { useLang } from '../i18n/LanguageContext.jsx'
import ArticlesGrid from '../components/ArticlesGrid.jsx'

export default function Articles() {
  const { t } = useLang()

  return (
    <div className="page">
      <div className="page__hero page__hero--articles">
        <div className="container">
          <span className="page__tag">📚 {t.nav.articles}</span>
          <h1>{t.articles.title}</h1>
          <p>{t.articles.subtitle}</p>
        </div>
      </div>

      <div className="container page__body">
        <ArticlesGrid filterable />
      </div>
    </div>
  )
}
