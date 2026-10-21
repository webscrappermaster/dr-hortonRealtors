import { statesIndex } from './statesIndex'

/* Carga lazy de JSONs de estado disponibles.
   import.meta.glob resuelve los imports en build time; eager=true los incluye en el bundle inicial.
   Solo los estados con JSON enriquecido tienen página real; el resto muestra ComingSoon. */
const stateModules = import.meta.glob('./states/*.json', { eager: true })

const loadedStates = Object.fromEntries(
  Object.entries(stateModules).map(([path, mod]) => {
    const slug = path.replace('./states/', '').replace('.json', '')
    return [slug, mod.default ?? mod]
  }),
)

/* Glob de imágenes de comunidades para resolución en runtime */
const locationImages = import.meta.glob(
  '/src/assets/images/locations/**/*.webp',
  { eager: true, import: 'default' },
)

function resolveCardImage(stateSlug, areaSlug, filename) {
  if (!filename) return null
  const areaPath = `/src/assets/images/locations/${stateSlug}/${areaSlug}/${filename}`
  if (locationImages[areaPath]) return locationImages[areaPath]
  const statePath = `/src/assets/images/locations/${stateSlug}/${filename}`
  return locationImages[statePath] ?? null
}

function enrichCommunity(comm, stateSlug, areaSlug) {
  return {
    ...comm,
    cardImageUrl: resolveCardImage(stateSlug, areaSlug, comm.cardImage),
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

/* Devuelve el StateEntry enriquecido o null si el slug no existe en absoluto. */
export function getState(slug) {
  if (loadedStates[slug]) return enrichState(loadedStates[slug])
  const found = statesIndex.find(s => s.slug === slug)
  /* null = slug no existe; objeto sin communities = existe pero sin datos */
  return found ? { ...found, markets: found.markets ?? [] } : null
}

/* Devuelve el AreaEntry con sus comunidades enriquecidas, o null. */
export function getArea(stateSlug, areaSlug) {
  const state = getState(stateSlug)
  if (!state) return null
  return state.markets?.find(m => m.slug === areaSlug) ?? null
}

/* Devuelve la comunidad específica, o null. */
export function getCommunity(stateSlug, areaSlug, citySlug, commSlug) {
  const area = getArea(stateSlug, areaSlug)
  if (!area?.communities) return null
  return (
    area.communities.find(
      c => c.slug === commSlug && c.citySlug === citySlug,
    ) ?? null
  )
}
