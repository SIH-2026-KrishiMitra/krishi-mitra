import 'i18next'
import type common from '../../public/locales/en/common.json'
import type auth from '../../public/locales/en/auth.json'
import type nav from '../../public/locales/en/nav.json'
import type farmer from '../../public/locales/en/farmer.json'
import type buyer from '../../public/locales/en/buyer.json'
import type admin from '../../public/locales/en/admin.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      auth: typeof auth
      nav: typeof nav
      farmer: typeof farmer
      buyer: typeof buyer
      admin: typeof admin
    }
  }
}
