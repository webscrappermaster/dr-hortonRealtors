import { createContext } from 'react'
import { DEFAULT_SETTINGS } from '../../config/siteSettings'

const VITE_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || null

export const defaultSettings = {
  ...DEFAULT_SETTINGS,
  whatsappNumber: DEFAULT_SETTINGS.whatsappNumber ?? VITE_NUMBER,
}

export const SiteSettingsContext = createContext(defaultSettings)
