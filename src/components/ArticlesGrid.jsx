import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import ArticleModal from './ArticleModal.jsx'

// Decorative gradient header per article tag (no external images needed).
const TAG_THEME = {
  'בדיקות דם': 'theme-blood',
  'Blood Tests': 'theme-blood',
  'אורח חיים': 'theme-life',
  Lifestyle: 'theme-life',
  תזונה: 'theme-nutri',
  Nutrition: 'theme-nutri',
  עיניים: 'theme-eye',
  Eyes: 'theme-eye',
  בדיקות: 'theme-check',
  Checkups: 'theme-check',
  ויטמינים: 'theme-vitamin',
  Vitamins: 'theme-vitamin',
  'רפואת סבתא': 'theme-folk',
  'Folk remedies': 'theme-folk',
}

const TAG_EMOJI = {
  'בדיקות דם': '🩸', 'Blood Tests': '🩸',
  'אורח חיים': '🏃', Lifestyle: '🏃',
  תזונה: '🥗', Nutrition: '🥗',
  עיניים: '👁️', Eyes: '👁️',
  בדיקות: '🔬', Checkups: '🔬',
  ויטמינים: '💊', Vitamins: '💊',
  'רפואת סבתא': '🍵', 'Folk remedies': '🍵',
}

export default function ArticlesGrid({ limit, filterable }) {
  const { t } = useLang()
  const [active, setActive] = useState(null)
  const [tag, setTag] = useState('all')

  // Unique tags in list order, for the filter chips.
  const tags = []
  t.articles.list.forEach((a) => { if (!tags.includes(a.tag)) tags.push(a.tag) })

  let items = t.articles.list
  if (filterable && tag !== 'all') items = items.filter((a) => a.tag === tag)
  if (limit) items = items.slice(0, limit)

  return (
    <>
      {filterable && (
        <div className="article-filters">
          <button
            type="button"
            className={`article-filter ${tag === 'all' ? 'is-active' : ''}`}
            onClick={() => setTag('all')}
          >{t.articles.all}</button>
          {tags.map((tg) => (
            <button
              key={tg}
              type="button"
              className={`article-filter ${tag === tg ? 'is-active' : ''}`}
              onClick={() => setTag(tg)}
            >
              {TAG_EMOJI[tg] || '📄'} {tg}
            </button>
          ))}
        </div>
      )}

      <div className="articles__grid">
        {items.map((a) => (
          <article
            key={a.id}
            className="article-card"
            onClick={() => setActive(a)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(a)}
          >
            <div className={`article-card__media ${TAG_THEME[a.tag] || 'theme-life'}`}>
              <span className="article-card__emoji">{TAG_EMOJI[a.tag] || '📄'}</span>
              <span className="article-card__tag">{a.tag}</span>
            </div>
            <div className="article-card__body">
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
              <div className="article-card__foot">
                <span className="article-card__time">⏱️ {a.minutes} {t.articles.readingTime}</span>
                <span className="article-card__link">{t.articles.readMore} →</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {active && <ArticleModal article={active} onClose={() => setActive(null)} />}
    </>
  )
}
