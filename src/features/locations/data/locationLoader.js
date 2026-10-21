import { statesIndex } from './statesIndex'

const stateModules = import.meta.glob('./states/*.json', { eager: true })
const communityModules = import.meta.glob('./communities/**/*.json', { eager: true })

const loadedStates = Object.fromEntries(
  Object.entries(stateModules).map(([path, mod]) => {
    const slug = path.replace('./states/', '').replace('.json', '')
    return [slug, mod.default ?? mod]
  }),
)

/* Clave: "stateSlug/commSlug" → detalle enriquecido */
const loadedCommunityDetails = Object.fromEntries(
  Object.entries(communityModules).map(([path, mod]) => {
    const key = path.replace('./communities/', '').replace('.json', '')
    return [key, mod.default ?? mod]
  }),
)

const locationImages = import.meta.glob(
  '/src/assets/images/locations/**/*.webp',
  { eager: true, import: 'default' },
)

function resolveImage(...segments) {
  const path = `/src/assets/images/locations/${segments.join('/')}`
  return locationImages[path] ?? null
}

function enrichCommunity(comm, stateSlug, areaSlug) {
  return {
    ...comm,
    cardImageUrl: resolveImage(stateSlug, areaSlug, comm.cardImage),
  }
}

function enrichState(data) {
  return {
    ...data,
    markets: data.markets.map(area => ({
      ...area,
      communities: area.communities.map(c =>
        enrichCommunity(c, data.slug, area.slug),
      ),
    })),
  }
}

export function getState(slug) {
  if (loadedStates[slug]) return enrichState(loadedStates[slug])
  const found = statesIndex.find(s => s.slug === slug)
  return found ? { ...found, markets: found.markets ?? [] } : null
}

export function getArea(stateSlug, areaSlug) {
  const state = getState(stateSlug)
  if (!state) return null
  return state.markets?.find(m => m.slug === areaSlug) ?? null
}

export function getCommunity(stateSlug, areaSlug, citySlug, commSlug) {
  const area = getArea(stateSlug, areaSlug)
  if (!area?.communities) return null
  const base = area.communities.find(
    c => c.slug === commSlug && c.citySlug === citySlug,
  )
  if (!base) return null

  const detail = loadedCommunityDetails[`${stateSlug}/${commSlug}`]
  if (!detail) return base

  const res = filename => resolveImage(stateSlug, commSlug, filename)

  return {
    ...base,
    gallery: detail.gallery?.map(item => ({
      ...item,
      imageUrl: res(item.filename),
    })) ?? base.gallery,
    about: detail.about ?? base.about,
    amenities: detail.amenities ?? base.amenities,
    schools: detail.schools ?? base.schools,
    lotMapUrl: res(detail.lotMapFilename),
    promoSlot: detail.promoSlot
      ? { ...detail.promoSlot, imageUrl: res(detail.promoSlot.image) }
      : base.promoSlot,
    floorPlans: detail.floorPlans?.map(fp => ({
      ...fp,
      imageUrl: res(fp.image),
    })) ?? base.floorPlans,
    availableHomes: detail.availableHomes?.map(h => ({
      ...h,
      imageUrl: res(h.image),
    })) ?? base.availableHomes,
  }
}
