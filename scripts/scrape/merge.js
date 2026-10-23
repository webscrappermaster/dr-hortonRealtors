#!/usr/bin/env node
// Parte 3 — merge.js: integra casas scrapeadas en src/features/locations/data/states/{state}.json
//
// Comportamiento:
//   - Si el JSON de estado no existe → lo CREA desde cero usando statesIndex + datos raw.
//   - Si existe → AGREGA áreas y comunidades que falten; actualiza availableHomes respetando
//     comunidades curadas (communities/{state}/{comm}.json con availableHomes !== null).
//   - Genera IDs globales únicos por casa: ${stateSlug}-${commSlug}-${streetSlug}.
//   - Excluye raw/recon.
//   - Reporta IDs duplicados al finalizar.
//
// Uso:
//   node scripts/scrape/merge.js                   # todos los estados
//   node scripts/scrape/merge.js --states=georgia  # solo Georgia

import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { statesIndex } from '../../src/features/locations/data/statesIndex.js'

const RAW_DIR    = path.resolve('docs/reference/scraping/raw')
const STATES_DIR = path.resolve('src/features/locations/data/states')
const COMMS_DIR  = path.resolve('src/features/locations/data/communities')

const EXCLUDED_DIRS = new Set(['recon'])

// ── Args ─────────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => {
      const [k, v] = a.replace(/^--/, '').split('=')
      return [k, v ?? true]
    }),
)

const filterStates = args.states
  ? args.states.split(',').map(s => s.trim().toLowerCase())
  : null

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(str) {
  return (str ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function sellingStatusToSlug(raw) {
  if (!raw) return null
  const n = raw.toLowerCase().replace(/[^a-z0-9 ]+/g, '').trim()
  if (n.includes('now selling') || n.includes('move in ready') || n.includes('move-in-ready')) return 'now-selling'
  if (n.includes('final'))        return 'final-opportunities'
  if (n.includes('coming soon'))  return 'coming-soon'
  if (n.includes('sold out'))     return 'sold-out'
  return null
}

// "Richardson, TX 75080" → { cityName, citySlug, zip }
function parseCityAddress(commAddress) {
  if (!commAddress) return { cityName: null, citySlug: null, zip: null }
  const m = commAddress.match(/^([^,]+),\s*[A-Z]{2}\s+(\d{5})$/)
  if (m) {
    const cityName = m[1].trim()
    return { cityName, citySlug: toSlug(cityName), zip: m[2] }
  }
  const cityName = commAddress.split(',')[0].trim()
  return { cityName, citySlug: toSlug(cityName), zip: null }
}

// "/texas/dallas/richardson/greenwood-square" → { stateSlug, areaSlug, citySlug, commSlug }
function parseCommPageLink(link) {
  if (!link) return null
  const parts = link.replace(/^\//, '').split('/')
  if (parts.length < 4) return null
  return { stateSlug: parts[0], areaSlug: parts[1], citySlug: parts[2], commSlug: parts[3] }
}

function streetToSlug(street) {
  if (!street) return null
  return street.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function buildHomeId(stateSlug, commSlug, street, lot) {
  const streetPart = streetToSlug(street) ?? (lot != null ? `lot-${lot}` : null)
  if (!streetPart) return null
  return `${stateSlug}-${commSlug}-${streetPart}`
}

// Limpia artifacts de encoding en strings scrapeados
function sanitize(str) {
  if (!str) return null
  return str
    .replace(/â€™/g, "'").replace(/â€œ/g, '"').replace(/â€/g, '"')
    .replace(/â„¢/g, '™').replace(/Â®/g, '®').replace(/Â/g, '')
    .trim() || null
}

// ── Curación ──────────────────────────────────────────────────────────────────

async function hasCuratedHomes(stateSlug, communitySlug) {
  const file = path.join(COMMS_DIR, stateSlug, `${communitySlug}.json`)
  if (!existsSync(file)) return false
  try {
    const data = JSON.parse(await readFile(file, 'utf8'))
    return Array.isArray(data.availableHomes) && data.availableHomes.length > 0
  } catch {
    return false
  }
}

// ── Formato AvailableHomeCard ─────────────────────────────────────────────────

function toCardFormat(rawHome, commAddress, stateSlug, commSlug) {
  const { street, baths, garage, lotNumber, price, originalPrice, status } = rawHome

  const cardStatus = status === 'available'       ? 'available'
    : status === 'under-contract' ? 'under-contract'
    : null

  return {
    id: buildHomeId(stateSlug, commSlug, street, lotNumber),
    address: street ?? null,
    cityStateZip: commAddress ?? null,
    planName: rawHome.planName ?? null,
    price: price ?? null,
    wasPrice: originalPrice ?? null,
    beds: rawHome.beds ?? null,
    baths: baths ?? null,
    garages: garage ?? null,
    stories: rawHome.stories ?? null,
    sqft: rawHome.sqft ?? null,
    lot: lotNumber ?? null,
    status: cardStatus,
    isRte: false,
    image: null,
  }
}

// ── Construcción de entradas de comunidad ─────────────────────────────────────

// Desde _area.json CommunityData
function commFromAreaEntry(cd, stateSlug, areaSlug) {
  const parsed = parseCommPageLink(cd.commPageLink)
  const commSlug = parsed?.commSlug ?? toSlug(cd.commName)
  const citySlug = parsed?.citySlug ?? null
  const { cityName, zip } = parseCityAddress(cd.commAddress)

  return {
    slug: commSlug,
    name: cd.commName ?? null,
    stateSlug,
    areaSlug,
    citySlug,
    cityName,
    zip,
    address: null,
    phone: null,
    hours: null,
    series: sanitize(cd.commBrand),
    status: sellingStatusToSlug(cd.commSellingStatus),
    tag: null,
    priceFrom: cd.commMinPrice ?? null,
    availableHomesCount: cd.commAvailableHomes ?? null,
    beds:    { min: cd.commMinBeds    ?? null, max: cd.commMaxBeds    ?? null },
    baths:   { min: cd.commMinBaths   ?? null, max: cd.commMaxBaths   ?? null },
    garages: { min: cd.commMinCars    ?? null, max: cd.commMaxCars    ?? null },
    stories: { min: cd.commMinStories ?? null, max: cd.commMaxStories ?? null },
    sqftFrom: cd.commMinSqft ?? null,
    cardImage: null,
    gallery: null,
    about: null,
    amenities: null,
    schools: null,
    lotMapUrl: null,
    promoSlot: null,
    floorPlans: null,
    availableHomes: null,
    location: {
      lat: cd.commCoordsLat ?? null,
      lng: cd.commCoordsLng ?? null,
    },
  }
}

// Desde JSON individual de comunidad (cuando no hay _area.json)
function commFromRawJson(raw, stateSlug, areaSlug) {
  const { cityName, citySlug, zip } = parseCityAddress(raw.commAddress)
  const homes = raw.homes ?? []
  const prices    = homes.map(h => h.price).filter(p => p != null)
  const bedsList  = homes.map(h => h.beds).filter(b => b != null)
  const bathsList = homes.map(h => h.baths).filter(b => b != null)
  const garList   = homes.map(h => h.garage).filter(g => g != null)
  const storList  = homes.map(h => h.stories).filter(s => s != null)
  const sqftList  = homes.map(h => h.sqft).filter(s => s != null)

  return {
    slug: raw.communitySlug,
    name: raw.commName ?? null,
    stateSlug,
    areaSlug,
    citySlug: raw.citySlug ?? citySlug,
    cityName,
    zip,
    address: null,
    phone: null,
    hours: null,
    series: null,
    status: sellingStatusToSlug(raw.commSellingStatus),
    tag: null,
    priceFrom: prices.length ? Math.min(...prices) : null,
    availableHomesCount: homes.filter(h => h.status === 'available').length || null,
    beds:    { min: bedsList.length  ? Math.min(...bedsList)  : null, max: bedsList.length  ? Math.max(...bedsList)  : null },
    baths:   { min: bathsList.length ? Math.min(...bathsList) : null, max: bathsList.length ? Math.max(...bathsList) : null },
    garages: { min: garList.length   ? Math.min(...garList)   : null, max: garList.length   ? Math.max(...garList)   : null },
    stories: { min: storList.length  ? Math.min(...storList)  : null, max: storList.length  ? Math.max(...storList)  : null },
    sqftFrom: sqftList.length ? Math.min(...sqftList) : null,
    cardImage: null,
    gallery: null,
    about: null,
    amenities: null,
    schools: null,
    lotMapUrl: null,
    promoSlot: null,
    floorPlans: null,
    availableHomes: null,
    location: {
      lat: raw.commCoordsLat ?? null,
      lng: raw.commCoordsLng ?? null,
    },
  }
}

// ── Carga datos crudos de un área ─────────────────────────────────────────────

async function loadAreaRaw(stateSlug, areaSlug) {
  const areaPath = path.join(RAW_DIR, stateSlug, areaSlug)
  if (!existsSync(areaPath)) return null

  // Archivos individuales de comunidad (excluye _area.json)
  const files = await readdir(areaPath).catch(() => [])
  const commFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('_'))
  const rawCommMap = {}
  for (const file of commFiles) {
    try {
      const raw = JSON.parse(await readFile(path.join(areaPath, file), 'utf8'))
      const key = raw.communitySlug ?? file.replace('.json', '')
      rawCommMap[key] = raw
    } catch { /* ignora archivos corruptos */ }
  }

  // _area.json opcional
  let areaJson = null
  const areaJsonPath = path.join(areaPath, '_area.json')
  if (existsSync(areaJsonPath)) {
    try { areaJson = JSON.parse(await readFile(areaJsonPath, 'utf8')) } catch { /* ignora */ }
  }

  const communities = []

  if (areaJson?.CommunityData?.length) {
    for (const cd of areaJson.CommunityData) {
      if (!cd.commPageLink) continue
      const comm = commFromAreaEntry(cd, stateSlug, areaSlug)

      const rawComm = rawCommMap[comm.slug]
      if (rawComm && !await hasCuratedHomes(stateSlug, comm.slug)) {
        const homes = (rawComm.homes ?? []).map(h =>
          toCardFormat(h, rawComm.commAddress, stateSlug, comm.slug),
        )
        if (homes.length > 0) {
          comm.availableHomes = homes
          comm.availableHomesCount = homes.filter(h => h.status === 'available').length
        }
      }

      communities.push(comm)
    }
  } else {
    // Sin _area.json: infiere metadata desde archivos individuales
    for (const raw of Object.values(rawCommMap)) {
      if (!raw.communitySlug) continue
      const comm = commFromRawJson(raw, stateSlug, areaSlug)

      if (!await hasCuratedHomes(stateSlug, comm.slug)) {
        const homes = (raw.homes ?? []).map(h =>
          toCardFormat(h, raw.commAddress, stateSlug, comm.slug),
        )
        if (homes.length > 0) {
          comm.availableHomes = homes
          comm.availableHomesCount = homes.filter(h => h.status === 'available').length
        }
      }

      communities.push(comm)
    }
  }

  const areaInfo = areaJson?.MetaData?.AreaInfoData
  const center   = areaInfo?.Latitude != null
    ? { lat: areaInfo.Latitude, lng: areaInfo.Longitude }
    : null
  const cities = [...new Set(communities.map(c => c.citySlug).filter(Boolean))]

  return { center, heroTitle: areaInfo?.Title ?? null, cities, communities }
}

// ── Verificación de IDs duplicados ────────────────────────────────────────────

function findDuplicateIds(stateData) {
  const seen = new Map()
  const dupes = []
  for (const mkt of stateData.markets ?? []) {
    for (const comm of mkt.communities ?? []) {
      for (const home of comm.availableHomes ?? []) {
        if (!home.id) continue
        if (seen.has(home.id)) {
          dupes.push({ id: home.id, area: mkt.slug, community: comm.slug })
        } else {
          seen.set(home.id, { area: mkt.slug, community: comm.slug })
        }
      }
    }
  }
  return dupes
}

// ── Construye estado nuevo desde cero ─────────────────────────────────────────

async function buildNewState(stateSlug) {
  const indexEntry = statesIndex.find(s => s.slug === stateSlug)
  if (!indexEntry) return null

  const markets = []
  for (const mkt of indexEntry.markets ?? []) {
    const rawArea = await loadAreaRaw(stateSlug, mkt.slug)
    markets.push({
      slug: mkt.slug,
      name: mkt.name,
      aria: mkt.aria,
      stateSlug,
      heroTitle: rawArea?.heroTitle ?? null,
      blurb: null,
      totalResults: null,
      resultsRadiusMiles: null,
      center: rawArea?.center ?? null,
      cities: rawArea?.cities ?? [],
      communities: rawArea?.communities ?? [],
    })
  }

  return {
    slug: stateSlug,
    name: indexEntry.name,
    aria: indexEntry.aria,
    blurb: null,
    resultsRadiusMiles: null,
    totalResults: null,
    markets,
  }
}

// ── Merge en estado existente ─────────────────────────────────────────────────

async function mergeIntoExisting(stateSlug, existingData) {
  let updated = 0
  let added   = 0
  let curated = 0

  const rawStateDir = path.join(RAW_DIR, stateSlug)
  if (!existsSync(rawStateDir)) {
    console.log(`  ⚠ Sin datos crudos para ${stateSlug}`)
    return { updated, added, curated }
  }

  const indexEntry  = statesIndex.find(s => s.slug === stateSlug)
  const indexMkts   = indexEntry?.markets ?? []
  const rawAreaDirs = (await readdir(rawStateDir).catch(() => [])).filter(
    d => !EXCLUDED_DIRS.has(d),
  )

  for (const areaSlug of rawAreaDirs) {
    const areaPath = path.join(rawStateDir, areaSlug)
    const s = await stat(areaPath).catch(() => null)
    if (!s?.isDirectory()) continue

    const rawArea = await loadAreaRaw(stateSlug, areaSlug)
    if (!rawArea) continue

    const existingMkt = existingData.markets?.find(m => m.slug === areaSlug)

    if (!existingMkt) {
      // Área no existe → agregarla entera
      const mktIdx = indexMkts.find(m => m.slug === areaSlug)
      existingData.markets = existingData.markets ?? []
      existingData.markets.push({
        slug: areaSlug,
        name: mktIdx?.name ?? areaSlug,
        aria: mktIdx?.aria ?? areaSlug,
        stateSlug,
        heroTitle: rawArea.heroTitle,
        blurb: null,
        totalResults: null,
        resultsRadiusMiles: null,
        center: rawArea.center,
        cities: rawArea.cities,
        communities: rawArea.communities,
      })
      added += rawArea.communities.length
      console.log(`    + área nueva: ${areaSlug} (${rawArea.communities.length} comunidades)`)
      continue
    }

    // Área existe → agregar comunidades faltantes o actualizar homes
    for (const newComm of rawArea.communities) {
      const existing = existingMkt.communities?.find(c => c.slug === newComm.slug)

      if (!existing) {
        existingMkt.communities = existingMkt.communities ?? []
        existingMkt.communities.push(newComm)
        added++
        console.log(`    + comunidad nueva: ${newComm.slug}`)
        continue
      }

      // Comunidad existe → actualizar availableHomes si no es curada
      if (newComm.availableHomes) {
        if (await hasCuratedHomes(stateSlug, existing.slug)) {
          curated++
          continue
        }
        existing.availableHomes = newComm.availableHomes
        existing.availableHomesCount = newComm.availableHomesCount
        updated++
        console.log(`    ✓ ${existing.slug}: ${newComm.availableHomes.length} tarjetas`)
      }
    }
  }

  return { updated, added, curated }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mkdir(STATES_DIR, { recursive: true })

  let stateSlugs
  if (filterStates) {
    stateSlugs = filterStates
  } else {
    const entries = await readdir(RAW_DIR).catch(() => [])
    stateSlugs = []
    for (const entry of entries) {
      if (EXCLUDED_DIRS.has(entry)) continue
      const s = await stat(path.join(RAW_DIR, entry)).catch(() => null)
      if (s?.isDirectory()) stateSlugs.push(entry)
    }
  }

  let totalCreated = 0
  let totalAdded   = 0
  let totalUpdated = 0
  let totalCurated = 0
  const allDupes   = []

  for (const stateSlug of stateSlugs) {
    console.log(`\n→ ${stateSlug}`)
    const stateFile = path.join(STATES_DIR, `${stateSlug}.json`)

    if (existsSync(stateFile)) {
      const existingData = JSON.parse(await readFile(stateFile, 'utf8'))
      const { updated, added, curated } = await mergeIntoExisting(stateSlug, existingData)

      if (updated > 0 || added > 0) {
        const dupes = findDuplicateIds(existingData)
        if (dupes.length > 0) {
          allDupes.push(...dupes)
          console.log(`  ⚠ ${dupes.length} IDs duplicados`)
          dupes.forEach(d => console.log(`    - ${d.id}`))
        }
        await writeFile(stateFile, JSON.stringify(existingData, null, 2), 'utf8')
        console.log(`  ✓ actualizado — ${updated} homes, ${added} nuevas comunidades, ${curated} curados omitidos`)
      } else {
        console.log(`  — sin cambios (${curated} curados)`)
      }

      totalUpdated += updated
      totalAdded   += added
      totalCurated += curated
    } else {
      const newState = await buildNewState(stateSlug)
      if (!newState) {
        console.log(`  ⚠ No está en statesIndex — skip`)
        continue
      }

      const dupes = findDuplicateIds(newState)
      if (dupes.length > 0) {
        allDupes.push(...dupes)
        console.log(`  ⚠ ${dupes.length} IDs duplicados`)
        dupes.forEach(d => console.log(`    - ${d.id}`))
      }

      const commCount = newState.markets.reduce((s, m) => s + m.communities.length, 0)
      await writeFile(stateFile, JSON.stringify(newState, null, 2), 'utf8')
      console.log(`  ✓ CREADO — ${newState.markets.length} áreas, ${commCount} comunidades`)
      totalCreated++
    }
  }

  console.log(`\n✓ Merge completo:`)
  console.log(`  ${totalCreated} estados nuevos creados`)
  console.log(`  ${totalAdded} comunidades nuevas agregadas`)
  console.log(`  ${totalUpdated} comunidades actualizadas (homes)`)
  console.log(`  ${totalCurated} comunidades curadas omitidas`)
  if (allDupes.length > 0) {
    console.log(`  ⚠ ${allDupes.length} IDs duplicados en total — ver detalle arriba`)
  } else {
    console.log(`  ✓ Sin IDs duplicados`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
