import { getSessionFromRequest } from '../_lib/session.js'
import { checkOrigin } from '../_lib/origin.js'
import { updateSettings } from '../_lib/edgeConfig.js'

const PHONE_RE = /^\d{8,15}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const ALLOWED_FIELDS = new Set(['whatsappNumber', 'promoDeadline'])

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (!getSessionFromRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body ?? {}

  for (const key of Object.keys(body)) {
    if (!ALLOWED_FIELDS.has(key)) {
      return res.status(400).json({ error: `Campo no permitido: ${key}` })
    }
  }

  if (body.whatsappNumber !== undefined) {
    if (typeof body.whatsappNumber !== 'string' || !PHONE_RE.test(body.whatsappNumber)) {
      return res.status(400).json({ error: 'whatsappNumber: solo dígitos, 8 a 15 caracteres' })
    }
  }

  if (body.promoDeadline !== undefined) {
    if (typeof body.promoDeadline !== 'string' || !DATE_RE.test(body.promoDeadline)) {
      return res.status(400).json({ error: 'promoDeadline: formato ISO requerido (YYYY-MM-DD)' })
    }
    const date = new Date(body.promoDeadline)
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'promoDeadline: fecha no válida' })
    }
  }

  try {
    const { updatedAt } = await updateSettings(body)
    return res.status(200).json({ ok: true, updatedAt })
  } catch (err) {
    console.error('Error al actualizar ajustes:', err.message)
    return res.status(500).json({ error: 'No se pudieron guardar los ajustes' })
  }
}
