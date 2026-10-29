import { get } from '@vercel/global-config'
import { DEFAULT_SETTINGS } from './defaults.js'

const configured = Boolean(process.env.GLOBAL_CONFIG ?? process.env.EDGE_CONFIG)

export async function getSettings() {
  if (!configured) {
    return {
      whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
      promoDeadline: DEFAULT_SETTINGS.promoDeadline,
      promoStartDate: DEFAULT_SETTINGS.promoStartDate,
      facebookUrl: DEFAULT_SETTINGS.facebookUrl,
      instagramUrl: DEFAULT_SETTINGS.instagramUrl,
      updatedAt: null,
    }
  }

  const [whatsappNumber, promoDeadline, promoStartDate, facebookUrl, instagramUrl, updatedAt] = await Promise.all([
    get('whatsappNumber').catch(() => undefined),
    get('promoDeadline').catch(() => undefined),
    get('promoStartDate').catch(() => undefined),
    get('facebookUrl').catch(() => undefined),
    get('instagramUrl').catch(() => undefined),
    get('updatedAt').catch(() => undefined),
  ])

  return {
    whatsappNumber: whatsappNumber ?? DEFAULT_SETTINGS.whatsappNumber,
    promoDeadline: promoDeadline ?? DEFAULT_SETTINGS.promoDeadline,
    promoStartDate: promoStartDate ?? DEFAULT_SETTINGS.promoStartDate,
    facebookUrl: facebookUrl ?? DEFAULT_SETTINGS.facebookUrl,
    instagramUrl: instagramUrl ?? DEFAULT_SETTINGS.instagramUrl,
    updatedAt: updatedAt ?? null,
  }
}

export async function updateSettings({ whatsappNumber, promoDeadline, promoStartDate, facebookUrl, instagramUrl }) {
  const configId = process.env.GLOBAL_CONFIG_ID
  const token = process.env.VERCEL_ACCESS_TOKEN
  if (!configId || !token) throw new Error('ENV_MISSING')

  const updatedAt = new Date().toISOString()

  const items = []
  if (whatsappNumber !== undefined) items.push({ operation: 'upsert', key: 'whatsappNumber', value: whatsappNumber })
  if (promoDeadline !== undefined) items.push({ operation: 'upsert', key: 'promoDeadline', value: promoDeadline })
  if (promoStartDate !== undefined) items.push({ operation: 'upsert', key: 'promoStartDate', value: promoStartDate })
  if (facebookUrl !== undefined) items.push({ operation: 'upsert', key: 'facebookUrl', value: facebookUrl })
  if (instagramUrl !== undefined) items.push({ operation: 'upsert', key: 'instagramUrl', value: instagramUrl })
  items.push({ operation: 'upsert', key: 'updatedAt', value: updatedAt })

  // Los stores ecfg_* son Edge Config; la ruta de escritura es /v1/edge-config/
  const url = new URL(`https://api.vercel.com/v1/edge-config/${configId}/items`)
  const teamId = process.env.VERCEL_TEAM_ID
  if (teamId) url.searchParams.set('teamId', teamId)

  const res = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })

  if (!res.ok) {
    let errorCode = String(res.status)
    try {
      const json = await res.json()
      errorCode = json?.error?.code ?? String(res.status)
    } catch { /* mantener el status como código de error */ }
    throw new Error(`GC_WRITE_FAILED:${res.status}:${errorCode}`)
  }

  /* Devolver todos los campos escritos para que el handler pueda confirmarlos al cliente */
  const saved = { updatedAt }
  if (whatsappNumber !== undefined) saved.whatsappNumber = whatsappNumber
  if (promoDeadline !== undefined) saved.promoDeadline = promoDeadline
  if (promoStartDate !== undefined) saved.promoStartDate = promoStartDate
  if (facebookUrl !== undefined) saved.facebookUrl = facebookUrl
  if (instagramUrl !== undefined) saved.instagramUrl = instagramUrl
  return saved
}
