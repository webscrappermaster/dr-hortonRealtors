#!/usr/bin/env node
// Parte 3 — merge.js: integra casas scrapeadas en src/features/locations/data/states/{state}.json
// sin sobrescribir datos curados a mano.
//
// Reglas:
//   - Si existe communities/{state}/{community}.json con availableHomes !== null → skip.
//   - Solo actualiza campos que estén en null en states/{state}.json.
//   - Los datos de casas se escriben en el formato del componente AvailableHomeCard
//     (address string, cityStateZip, baths número, garages, wasPrice, lot, isRte, image).
//
// Uso:
//   node scripts/scrape/merge.js                   # todos los estados
//   node scripts/scrape/merge.js --states=georgia  # solo Georgia

import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const RAW_DIR      = path.resolve('docs/reference/scraping/raw')
const STATES_DIR   = path.resolve('src/features/locations/data/states')
const COMMS_DIR    = path.resolve('src/features/locations/data/communities')

// ──────────────────────────────────────────────────────────────────────────────
// Args
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// Conversión al formato de AvailableHomeCard
// ──────────────────────────────────────────────────────────────────────────────

// Convierte el JSON crudo de crawl.js al formato que espera AvailableHomeCard
function toCardFormat(rawHome, commAddress) {
  const { street, baths: bathsRaw, garage, lotNumber, price, originalPrice, status } = rawHome

  // city/state/zip desde commAddress ("Jefferson, GA 30549")
  const cityStateZip = commAddress ?? null

  // baths: número plano (2.5 = 2 full + 1 half)
  const baths = bathsRaw ?? null

  // status: 'available' cuando hay href (en crudo), 'under-contract' de otra forma
  // El componente muestra: 'available' → "Available", 'move-in-ready' → "Move-In Ready"
  const cardStatus = status === 'available' ? 'available'
    : status === 'under-contract' ? 'under-contract'
    : null

  return {
    address: street ?? null,
    cityStateZip,
    planName: rawHome.planName ?? null,
    price: price ?? null,
    wasPrice: originalPrice ?? null,
    beds: rawHome.beds ?? null,
    baths,
    garages: garage ?? null,
    stories: rawHome.stories ?? null,
    sqft: rawHome.sqft ?? null,
    lot: lotNumber ?? null,
    status: cardStatus,
    isRte: false,
    image: null,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Verifica si una comunidad tiene datos curados de availableHomes
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// Merge para un estado
// ──────────────────────────────────────────────────────────────────────────────

async function mergeState(stateSlug) {
  const stateFile = path.join(STATES_DIR, `${stateSlug}.json`)
  if (!existsSync(stateFile)) {
    console.log(`  ⚠ No existe ${stateFile} — estado sin datos en la app, skip`)
    return { updated: 0, skipped: 0, curated: 0 }
  }

  const stateData = JSON.parse(await readFile(stateFile, 'utf8'))

  const rawStateDir = path.join(RAW_DIR, stateSlug)
  if (!existsSync(rawStateDir)) {
    console.log(`  ⚠ Sin datos crudos para ${stateSlug}`)
    return { updated: 0, skipped: 0, curated: 0 }
  }

  // Carga todos los JSON crudos del estado en un mapa communitySlug → rawData
  const rawMap = {}
  const areaDirs = await readdir(rawStateDir).catch(() => [])
  for (const areaDir of areaDirs) {
    const areaPath = path.join(rawStateDir, areaDir)
    const s = await stat(areaPath).catch(() => null)
    if (!s?.isDirectory()) continue
    const files = await readdir(areaPath).catch(() => [])
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      const commSlug = file.replace('.json', '')
      const raw = JSON.parse(await readFile(path.join(areaPath, file), 'utf8'))
      rawMap[commSlug] = raw
    }
  }

  let updated = 0
  let skipped = 0
  let curated = 0

  // Recorre markets → communities en el stateData
  for (const market of stateData.markets ?? []) {
    for (const comm of market.communities ?? []) {
      const { slug: commSlug } = comm

      // Hay datos scrapeados para esta comunidad?
      if (!rawMap[commSlug]) {
        skipped++
        continue
      }

      // Tiene datos curados? → skip
      if (await hasCuratedHomes(stateSlug, commSlug)) {
        console.log(`    skip (curado) ${commSlug}`)
        curated++
        continue
      }

      const raw = rawMap[commSlug]
      const homes = (raw.homes ?? []).map(h => toCardFormat(h, raw.commAddress))

      comm.availableHomes = homes
      comm.availableHomesCount = homes.filter(h => h.status === 'available').length

      // Rellena campos null con datos de la API si están disponibles
      if (comm.address == null && raw.commAddress) {
        // commAddress es "City, ST ZIP"; address del comm es la dirección física → no tenemos
      }

      console.log(`    ✓ ${commSlug}: ${homes.length} tarjetas`)
      updated++
    }
  }

  if (updated > 0) {
    await writeFile(stateFile, JSON.stringify(stateData, null, 2), 'utf8')
    console.log(`  ✓ ${stateFile} actualizado (${updated} comunidades)`)
  } else {
    console.log(`  — ${stateFile} sin cambios (${curated} curados, ${skipped} sin datos)`)
  }

  return { updated, skipped, curated }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  let stateSlugs
  if (filterStates) {
    stateSlugs = filterStates
  } else {
    // Infiere desde los directorios en raw/
    const entries = await readdir(RAW_DIR).catch(() => [])
    stateSlugs = []
    for (const entry of entries) {
      const s = await stat(path.join(RAW_DIR, entry)).catch(() => null)
      if (s?.isDirectory()) stateSlugs.push(entry)
    }
  }

  let totalUpdated = 0
  let totalCurated = 0

  for (const stateSlug of stateSlugs) {
    console.log(`\n→ ${stateSlug}`)
    const { updated, curated } = await mergeState(stateSlug)
    totalUpdated += updated
    totalCurated += curated
  }

  console.log(`\n✓ Merge completo: ${totalUpdated} comunidades actualizadas, ${totalCurated} curadas omitidas.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
