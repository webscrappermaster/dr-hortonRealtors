import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const DURATION_MS = 8 * 60 * 60 * 1000

// Formato del token: {64hexId}.{timestampMs}.{64hexHMAC}
export function createSessionToken() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET no configurado')
  const id = randomBytes(32).toString('hex')
  const expires = Date.now() + DURATION_MS
  const payload = `${id}.${expires}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifySessionToken(token) {
  const secret = process.env.SESSION_SECRET
  if (!secret || !token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [id, expiresStr, sig] = parts
  const expires = parseInt(expiresStr, 10)
  if (isNaN(expires) || Date.now() > expires) return false
  const payload = `${id}.${expiresStr}`
  const expectedSig = createHmac('sha256', secret).update(payload).digest('hex')
  try {
    const expectedBuf = Buffer.from(expectedSig, 'hex')
    const sigBuf = Buffer.from(sig, 'hex')
    if (expectedBuf.length !== sigBuf.length) return false
    return timingSafeEqual(expectedBuf, sigBuf)
  } catch {
    return false
  }
}

export function parseCookies(cookieHeader) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const idx = c.indexOf('=')
      return idx === -1
        ? [c.trim(), '']
        : [c.slice(0, idx).trim(), c.slice(idx + 1).trim()]
    })
  )
}

export function sessionCookieHeader(token) {
  // SameSite=Strict previene CSRF; Secure solo en HTTPS (no en vercel dev)
  const secure = process.env.VERCEL_ENV !== 'development' ? '; Secure' : ''
  return `session=${token}; HttpOnly${secure}; SameSite=Strict; Max-Age=${8 * 3600}; Path=/`
}

export function clearSessionCookieHeader() {
  const secure = process.env.VERCEL_ENV !== 'development' ? '; Secure' : ''
  return `session=; HttpOnly${secure}; SameSite=Strict; Max-Age=0; Path=/`
}

export function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie)
  return verifySessionToken(cookies.session ?? null)
}
