import { statesIndex } from './statesIndex'

// lazy: cada states/*.json se convierte en un chunk separado y solo se descarga
// al visitar ese estado — no va en el bundle inicial.
const stateModules = import.meta.glob('./states/*.json')
const communityModules = import.meta.glob('./communities/**/*.json', { eager: true })

// Caché: evita reimportar el mismo JSON en la misma sesión
const stateCache = new Map()

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

export async function getState(slug) {
  if (stateCache.has(slug)) return stateCache.get(slug)

  const key = `./states/${slug}.json`
  let result

  if (stateModules[key]) {
    const mod = await stateModules[key]()
    result = enrichState(mod.default ?? mod)
  } else {
    const found = statesIndex.find(s => s.slug === slug)
    result = found ? { ...found, markets: found.markets ?? [] } : null
  }

  stateCache.set(slug, result)
  return result
}

// getArea y getCommunity reciben stateData directamente (ya cargado por getState)
export function getArea(stateData, areaSlug) {
  return stateData?.markets?.find(m => m.slug === areaSlug) ?? null
}

export function getCommunity(stateData, areaSlug, citySlug, commSlug) {
  const area = getArea(stateData, areaSlug)
  if (!area?.communities) return null
  const base = area.communities.find(
    c => c.slug === commSlug && c.citySlug === citySlug,
  )
  if (!base) return null

  const detail = loadedCommunityDetails[`${stateData.slug}/${commSlug}`]
  if (!detail) return base

  const res = filename => resolveImage(stateData.slug, commSlug, filename)

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
