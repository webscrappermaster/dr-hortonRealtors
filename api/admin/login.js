import { verifyPassword } from '../_lib/password.js'
import { createSessionToken, sessionCookieHeader } from '../_lib/session.js'
import { checkRateLimit } from '../_lib/rateLimit.js'
import { checkOrigin } from '../_lib/origin.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ??
    req.socket?.remoteAddress ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Invalid credentials' })
  }

  const body = req.body ?? {}
  if (!body.password || typeof body.password !== 'string') {
    return res.status(400).json({ error: 'Invalid credentials' })
  }

  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) {
    return res.status(503).json({ error: 'Service unavailable' })
  }

  const valid = await verifyPassword(body.password, hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  res.setHeader('Set-Cookie', sessionCookieHeader(createSessionToken()))
  return res.status(200).json({ ok: true })
}
