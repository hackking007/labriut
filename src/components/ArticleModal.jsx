import { useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'

const TAG_EMOJI = {
  'בדיקות דם': '🩸', 'Blood Tests': '🩸',
  'אורח חיים': '🏃', Lifestyle: '🏃',
  תזונה: '🥗', Nutrition: '🥗',
  עיניים: '👁️', Eyes: '👁️',
  בדיקות: '🔬', Checkups: '🔬',
  ויטמינים: '💊', Vitamins: '💊',
  'רפואת סבתא': '🍵', 'Folk remedies': '🍵',
}

// Full-screen reading view for a single article. Closes on backdrop
// click or Esc. Content comes from the bilingual article object.
export default function ArticleModal({ article, onClose }) {
  const { t } = useLang()

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!article) return null

  return (
    <div className="article-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="article-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="article-modal__close" onClick={onClose} aria-label={t.articles.close}>
          ✕
        </button>

        <span className="article-modal__tag">
          {TAG_EMOJI[article.tag] || '📄'} {article.tag}
        </span>
        <h2 className="article-modal__title">{article.title}</h2>
        <p className="article-modal__meta">⏱️ {article.minutes} {t.articles.readingTime}</p>

        {article.tldr && (
          <div className="article-modal__tldr">
            <strong>{t.articles.tldrLabel}:</strong> {article.tldr}
          </div>
        )}

        <div className="article-modal__body">
          {article.body?.map((sec, i) => (
            <section key={i}>
              {sec.h && <h3>{sec.h}</h3>}
              <p>{sec.p}</p>
            </section>
          ))}
        </div>

        <p className="article-modal__disclaimer">⚕️ {t.articles.disclaimer}</p>

        <button className="btn btn--primary btn--block" onClick={onClose} type="button">
          {t.articles.close}
        </button>
      </div>
    </div>
  )
}
