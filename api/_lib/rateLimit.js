// Limitador en memoria: se reinicia en cada cold start de la función,
// lo cual es aceptable para un panel de administración de uso infrecuente.
const store = new Map()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

export function checkRateLimit(ip) {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}
