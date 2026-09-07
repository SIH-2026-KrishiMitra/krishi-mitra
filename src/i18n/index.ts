import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'

export const RTL_LANGS = new Set(['ur', 'ks', 'sd'])

export const SUPPORTED_LANGUAGES = [
  { code: 'en',  label: 'English',    nativeLabel: 'English' },
  { code: 'hi',  label: 'Hindi',      nativeLabel: 'हिंदी' },
  { code: 'mr',  label: 'Marathi',    nativeLabel: 'मराठी' },
  { code: 'gu',  label: 'Gujarati',   nativeLabel: 'ગુજરાતી' },
  { code: 'ta',  label: 'Tamil',      nativeLabel: 'தமிழ்' },
  { code: 'te',  label: 'Telugu',     nativeLabel: 'తెలుగు' },
  { code: 'kn',  label: 'Kannada',    nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml',  label: 'Malayalam',  nativeLabel: 'മലയാളം' },
  { code: 'pa',  label: 'Punjabi',    nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'bn',  label: 'Bengali',    nativeLabel: 'বাংলা' },
  { code: 'or',  label: 'Odia',       nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'as',  label: 'Assamese',   nativeLabel: 'অসমীয়া' },
  { code: 'ur',  label: 'Urdu',       nativeLabel: 'اردو',      rtl: true },
  { code: 'ks',  label: 'Kashmiri',   nativeLabel: 'کٲشُر',     rtl: true },
  { code: 'sd',  label: 'Sindhi',     nativeLabel: 'سنڌي',      rtl: true },
  { code: 'kok', label: 'Konkani',    nativeLabel: 'कोंकणी' },
  { code: 'mai', label: 'Maithili',   nativeLabel: 'मैथिली' },
  { code: 'mni', label: 'Manipuri',   nativeLabel: 'মৈতৈলোন্' },
  { code: 'ne',  label: 'Nepali',     nativeLabel: 'नेपाली' },
  { code: 'sa',  label: 'Sanskrit',   nativeLabel: 'संस्कृतम्' },
  { code: 'sat', label: 'Santali',    nativeLabel: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'doi', label: 'Dogri',      nativeLabel: 'डोगरी' },
  { code: 'brx', label: 'Bodo',       nativeLabel: 'बड़ो' },
] as const

export type LangCode = typeof SUPPORTED_LANGUAGES[number]['code']

const NAMESPACES = ['common', 'auth', 'nav', 'farmer', 'buyer', 'admin'] as const

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    ns: NAMESPACES,
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  })

export default i18n
