import { useEffect, useState } from 'react'
import { SiteSettingsContext, defaultSettings } from './siteSettingsContext'

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return
        setSettings(prev => ({
          ...prev,
          ...data,
          // Si la API devuelve null, mantiene el número del .env (respaldo en dev)
          whatsappNumber: data.whatsappNumber ?? prev.whatsappNumber,
        }))
      })
      .catch(() => {})
  }, [])

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}
