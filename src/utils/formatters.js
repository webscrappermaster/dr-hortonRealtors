const _usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const _num = new Intl.NumberFormat('en-US')

// "$254,900"
export const formatUSD = n => _usd.format(n)

// "254,900" — para sq. ft. y otros números sin símbolo de moneda
export const formatNumber = n => _num.format(n)

// "From the $254s" | "Call for Information" — formato abreviado para tarjetas de comunidad
export function formatPriceAbbr(priceFrom) {
  if (!priceFrom) return 'Call for Information'
  return `From the $${Math.floor(priceFrom / 1000)}s`
}
