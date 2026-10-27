import { WHATSAPP_NUMBER } from '../config/contact'
import { formatUSD } from './formatters'
import {
  MSG_GENERAL,
  MSG_COMMUNITY_TEMPLATE,
  MSG_HOME_TEMPLATE,
} from '../config/whatsappMessages'

export function buildWhatsAppUrl(message) {
  if (!WHATSAPP_NUMBER) return null
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildGeneralMessage() {
  return MSG_GENERAL
}

export function buildCommunityMessage(community) {
  return MSG_COMMUNITY_TEMPLATE
    .replace('{communityName}', community.name ?? '')
    .replace('{cityName}', community.cityName ?? '')
    .replace('{stateSlug}', community.stateSlug ?? '')
}

export function buildHomeMessage(home, community) {
  const address = home.address ?? (home.lot ? `Lot ${home.lot}` : 'a home')
  const price = home.price != null ? formatUSD(home.price) : 'Call for Information'
  const url = typeof window !== 'undefined' ? window.location.href : ''

  return MSG_HOME_TEMPLATE
    .replace('{address}', address)
    .replace('{communityName}', community?.name ?? '')
    .replace('{cityName}', community?.cityName ?? '')
    .replace('{stateSlug}', community?.stateSlug ?? '')
    .replace('{price}', price)
    .replace('{url}', url)
}
