import { formatUSD } from './formatters'
import {
  MSG_GENERAL,
  MSG_COMMUNITY_TEMPLATE,
  MSG_HOME_TEMPLATE,
  MSG_RFI_TEMPLATE,
  MSG_TOUR_TEMPLATE,
  MSG_TEXT_WITH_US_TEMPLATE,
  MSG_MAINTENANCE,
  MSG_LAND_CONTACT,
  MSG_WARRANTY_TEMPLATE,
  MSG_CONTACT_TEMPLATE,
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

export function buildMaintenanceMessage() {
  return MSG_MAINTENANCE
}

export function buildLandContactMessage() {
  return MSG_LAND_CONTACT
}

export function buildWarrantyMessage(values) {
  const phone = values.homePhone || values.cellPhone || values.workPhone || ''
  const phoneLine = phone ? `Phone: ${phone}\n` : ''
  const address = values.notListed
    ? `${values.noAddress}, ${values.noCity}, ${values.noState} ${values.noZip}`
    : values.address
  const url = typeof window !== 'undefined' ? window.location.href : ''
  return MSG_WARRANTY_TEMPLATE
    .replace('{firstName}', values.firstName.trim())
    .replace('{lastName}', values.lastName.trim())
    .replace('{email}', values.email.trim())
    .replace('{phoneLine}', phoneLine)
    .replace('{address}', address.trim())
    .replace('{requestDetails}', values.requestDetails.trim())
    .replace('{url}', url)
}

export function buildTextWithUsMessage(community) {
  return MSG_TEXT_WITH_US_TEMPLATE
    .replace('{communityName}', community?.name ?? '')
    .replace('{cityName}', community?.cityName ?? '')
    .replace('{stateSlug}', community?.stateSlug ?? '')
}

/* Formulario de contacto — no almacena datos en ningún lugar.
   inquiryLabel: etiqueta legible del tipo de consulta (no el value del select).
   requestDetails se recorta a 1 000 caracteres para que la URL de wa.me no falle. */
export function buildContactMessage(values, inquiryLabel) {
  const phoneLine          = values.phone?.trim()          ? `Phone: ${values.phone.trim()}\n`                    : ''
  const secondaryPhoneLine = values.secondaryPhone?.trim() ? `Secondary Phone: ${values.secondaryPhone.trim()}\n` : ''
  const addressLine        = values.address?.trim()        ? `Address: ${values.address.trim()}\n`                : ''
  const url     = typeof window !== 'undefined' ? window.location.href : ''
  const details = values.requestDetails.trim()
  const truncated = details.length > 1000 ? `${details.slice(0, 997)}...` : details

  return MSG_CONTACT_TEMPLATE
    .replace('{inquiryType}',        inquiryLabel ?? values.inquiryType)
    .replace('{firstName}',          values.firstName.trim())
    .replace('{lastName}',           values.lastName.trim())
    .replace('{phoneLine}',          phoneLine)
    .replace('{secondaryPhoneLine}', secondaryPhoneLine)
    .replace('{email}',              values.email.trim())
    .replace('{addressLine}',        addressLine)
    .replace('{state}',              values.state)
    .replace('{city}',               values.city.trim())
    .replace('{requestDetails}',     truncated)
    .replace('{url}',                url)
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
