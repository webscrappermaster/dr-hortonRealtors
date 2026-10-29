import { getSettings } from './_lib/edgeConfig.js'
import { DEFAULT_SETTINGS } from './_lib/defaults.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const settings = await getSettings()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(settings)
  } catch {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
      promoDeadline: DEFAULT_SETTINGS.promoDeadline,
      promoStartDate: DEFAULT_SETTINGS.promoStartDate,
      facebookUrl: DEFAULT_SETTINGS.facebookUrl,
      instagramUrl: DEFAULT_SETTINGS.instagramUrl,
      updatedAt: null,
    })
  }
}
