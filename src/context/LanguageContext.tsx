import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from 'react'
import i18n, { RTL_LANGS, type LangCode } from '../i18n'
import { useAuth } from './AuthContext'
import { updateProfile } from '../services/supabase/profiles'

const LS_KEY = 'km_lang'

const FONT_MAP: Partial<Record<LangCode, string>> = {
  hi:  'Noto+Sans+Devanagari:wght@400;500;700',
  mr:  'Noto+Sans+Devanagari:wght@400;500;700',
  ne:  'Noto+Sans+Devanagari:wght@400;500;700',
  mai: 'Noto+Sans+Devanagari:wght@400;500;700',
  sa:  'Noto+Sans+Devanagari:wght@400;500;700',
  kok: 'Noto+Sans+Devanagari:wght@400;500;700',
  doi: 'Noto+Sans+Devanagari:wght@400;500;700',
  brx: 'Noto+Sans+Devanagari:wght@400;500;700',
  gu:  'Noto+Sans+Gujarati:wght@400;500;700',
  ta:  'Noto+Sans+Tamil:wght@400;500;700',
  te:  'Noto+Sans+Telugu:wght@400;500;700',
  kn:  'Noto+Sans+Kannada:wght@400;500;700',
  ml:  'Noto+Sans+Malayalam:wght@400;500;700',
  pa:  'Noto+Sans+Gurmukhi:wght@400;500;700',
  bn:  'Noto+Sans+Bengali:wght@400;500;700',
  as:  'Noto+Sans+Bengali:wght@400;500;700',
  mni: 'Noto+Sans+Bengali:wght@400;500;700',
  or:  'Noto+Sans+Oriya:wght@400;500;700',
  ur:  'Noto+Nastaliq+Urdu:wght@400;500;700',
  ks:  'Noto+Nastaliq+Urdu:wght@400;500;700',
  sd:  'Noto+Kufi+Arabic:wght@400;700',
  sat: 'Noto+Sans+Ol+Chiki:wght@400;700',
}

function loadFont(code: LangCode) {
  const font = FONT_MAP[code]
  if (!font) return
  const id = `km-font-${code}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`
  document.head.appendChild(link)
}

function applyDOMForLang(code: LangCode) {
  const isRTL = RTL_LANGS.has(code)
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  document.documentElement.lang = code
  document.documentElement.setAttribute('data-lang', code)
  loadFont(code)
}

interface LanguageContextValue {
  lang: LangCode
  isRTL: boolean
  setLang: (code: LangCode) => Promise<void>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()

  const resolve = (): LangCode => {
    if (profile?.language) return profile.language as LangCode
    return (localStorage.getItem(LS_KEY) ?? 'en') as LangCode
  }

  const [lang, setLangState] = useState<LangCode>(resolve)

  useEffect(() => {
    if (profile?.language) {
      const code = profile.language as LangCode
      setLangState(code)
      void i18n.changeLanguage(code)
      applyDOMForLang(code)
    }
  }, [profile?.language])

  // Apply DOM on initial mount
  useEffect(() => {
    applyDOMForLang(lang)
    void i18n.changeLanguage(lang)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLang = useCallback(async (code: LangCode) => {
    setLangState(code)
    localStorage.setItem(LS_KEY, code)
    await i18n.changeLanguage(code)
    applyDOMForLang(code)

    if (user) {
      try {
        await updateProfile(user.id, { language: code })
      } catch {
        // non-fatal — localStorage already persists the preference
      }
    }
  }, [user])

  const isRTL = RTL_LANGS.has(lang)

  return (
    <LanguageContext.Provider value={{ lang, isRTL, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
