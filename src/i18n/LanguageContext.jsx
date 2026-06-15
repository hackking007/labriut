import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations } from './translations.js'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'labriut.lang'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'he'
    return window.localStorage.getItem(STORAGE_KEY) || 'he'
  })

  const t = translations[lang]

  // Keep <html> dir/lang in sync so RTL/LTR and fonts switch correctly.
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('lang', t.lang)
    html.setAttribute('dir', t.dir)
    window.localStorage.setItem(STORAGE_KEY, lang)
  }, [lang, t.lang, t.dir])

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'he' ? 'en' : 'he'))
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, dir: t.dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}
