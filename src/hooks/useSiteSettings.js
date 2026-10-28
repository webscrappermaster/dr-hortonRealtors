import { useContext } from 'react'
import { SiteSettingsContext } from '../app/providers/siteSettingsContext'

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
