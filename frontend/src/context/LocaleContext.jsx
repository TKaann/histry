import { createContext, useContext, useState, useEffect } from 'react'
import tr from '../i18n/tr.json'
import en from '../i18n/en.json'

const LOCALES = { tr, en }
const STORAGE_KEY = 'histry_locale'

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && LOCALES[saved]) return saved
    // Auto-detect from browser
    const lang = navigator.language.split('-')[0]
    return LOCALES[lang] ? lang : 'en'
  })

  const setLocale = (loc) => {
    localStorage.setItem(STORAGE_KEY, loc)
    setLocaleState(loc)
  }

  /**
   * t('game.won', { n: 3 }) → "You got it in 3 guess(es)!"
   */
  const t = (key, vars = {}) => {
    const keys = key.split('.')
    let val = LOCALES[locale]
    for (const k of keys) val = val?.[k]
    if (!val) return key
    return Object.entries(vars).reduce(
      (s, [k, v]) => s.replace(`{{${k}}}`, v),
      val
    )
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)
