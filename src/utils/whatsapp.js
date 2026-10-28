import { formatUSD } from './formatters'
import {
  MSG_GENERAL,
  MSG_COMMUNITY_TEMPLATE,
  MSG_HOME_TEMPLATE,
  MSG_RFI_TEMPLATE,
  MSG_TOUR_TEMPLATE,
} from '../config/whatsappMessages'

export function buildWhatsAppUrl(number, message) {
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
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

// Formularios de solicitud — no almacenan datos en ningún lado
export function buildRFIMessage({ firstName, lastName, email, phone }, community) {
  const phoneLine = phone ? `Phone: ${phone}\n` : ''
  const url = typeof window !== 'undefined' ? window.location.href : ''
  return MSG_RFI_TEMPLATE
    .replace('{communityName}', community?.name ?? '')
    .replace('{firstName}', firstName.trim())
    .replace('{lastName}', lastName.trim())
    .replace('{email}', email.trim())
    .replace('{phoneLine}', phoneLine)
    .replace('{url}', url)
}

export function buildTourMessage({ firstName, lastName, email, phone }, community) {
  const phoneLine = phone ? `Phone: ${phone}\n` : ''
  const url = typeof window !== 'undefined' ? window.location.href : ''
  return MSG_TOUR_TEMPLATE
    .replace('{communityName}', community?.name ?? '')
    .replace('{firstName}', firstName.trim())
    .replace('{lastName}', lastName.trim())
    .replace('{email}', email.trim())
    .replace('{phoneLine}', phoneLine)
    .replace('{url}', url)
}
