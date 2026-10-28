import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// Formato del hash: {32hexSalt}:{128hexDerivedKey}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = await scryptAsync(password, salt, 64)
  return `${salt}:${key.toString('hex')}`
}

export async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false
  const colonIdx = stored.indexOf(':')
  if (colonIdx === -1) return false
  const salt = stored.slice(0, colonIdx)
  const hash = stored.slice(colonIdx + 1)
  const derivedKey = await scryptAsync(password, salt, 64)
  const storedBuf = Buffer.from(hash, 'hex')
  if (derivedKey.length !== storedBuf.length) return false
  return timingSafeEqual(derivedKey, storedBuf)
}
