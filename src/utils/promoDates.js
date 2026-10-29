const SHORT_FMT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const LONG_FMT  = new Intl.DateTimeFormat('en-US', { month: 'long',  day: 'numeric' })

// Parsea fecha ISO como local para evitar desfase de zona horaria
export function parseLocalDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// "Nov 1" — formato corto para rangos y etiquetas
export function formatShort(iso) {
  return SHORT_FMT.format(parseLocalDate(iso))
}

// "November 1" — formato largo para el hero
export function formatLong(iso) {
  return LONG_FMT.format(parseLocalDate(iso))
}

// "Oct 9 – Nov 1" si hay fecha de inicio, o "Through Nov 1" si no la hay
export function formatPromoRange(promoStartDate, promoDeadline) {
  if (!promoDeadline) return ''
  const end = formatShort(promoDeadline)
  if (promoStartDate) return `${formatShort(promoStartDate)} – ${end}`
  return `Through ${end}`
}

// Devuelve true si el deadline es hoy o en el futuro
export function isPromoActive(promoDeadline) {
  if (!promoDeadline) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseLocalDate(promoDeadline) >= today
}
