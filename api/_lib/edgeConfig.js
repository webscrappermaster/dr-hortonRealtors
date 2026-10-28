import { get } from '@vercel/global-config'
import { DEFAULT_SETTINGS } from './defaults.js'

const configured = Boolean(process.env.GLOBAL_CONFIG ?? process.env.EDGE_CONFIG)

export async function getSettings() {
  if (!configured) {
    return {
      whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
      promoDeadline: DEFAULT_SETTINGS.promoDeadline,
      updatedAt: null,
    }
  }

  const [whatsappNumber, promoDeadline, updatedAt] = await Promise.all([
    get('whatsappNumber').catch(() => undefined),
    get('promoDeadline').catch(() => undefined),
    get('updatedAt').catch(() => undefined),
  ])

  return {
    whatsappNumber: whatsappNumber ?? DEFAULT_SETTINGS.whatsappNumber,
    promoDeadline: promoDeadline ?? DEFAULT_SETTINGS.promoDeadline,
    updatedAt: updatedAt ?? null,
  }
}

export async function updateSettings({ whatsappNumber, promoDeadline }) {
  const configId = process.env.GLOBAL_CONFIG_ID
  const token = process.env.VERCEL_ACCESS_TOKEN
  if (!configId || !token) throw new Error('GLOBAL_CONFIG_ID o VERCEL_ACCESS_TOKEN no configurados')

  const updatedAt = new Date().toISOString()

  const items = []
  if (whatsappNumber !== undefined) items.push({ operation: 'upsert', key: 'whatsappNumber', value: whatsappNumber })
  if (promoDeadline !== undefined) items.push({ operation: 'upsert', key: 'promoDeadline', value: promoDeadline })
  items.push({ operation: 'upsert', key: 'updatedAt', value: updatedAt })

  const res = await fetch(`https://api.vercel.com/v1/global-config/${configId}/items`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Global Config write failed: ${res.status} ${text}`)
  }

  return { updatedAt }
}
