#!/usr/bin/env node
// Parte 2 — normalize.js: convierte el JSON crudo de crawl.js al esquema
// de availableHome definido en el prompt. Sin peticiones de red.
//
// Uso:
//   node scripts/scrape/normalize.js                        # todos los crudos
//   node scripts/scrape/normalize.js --states=georgia       # solo Georgia
//   node scripts/scrape/normalize.js --out=custom/path.json # salida alternativa

import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const RAW_DIR  = path.resolve('docs/reference/scraping/raw')
const OUT_DIR  = path.resolve('docs/reference/scraping')

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
// Normalización
// ──────────────────────────────────────────────────────────────────────────────

function slugFromHref(href) {
  if (!href) return null
  // href: /georgia/atlanta/jefferson/jackson-landing/qmis/195-elsa-court
  return href.split('/').at(-1) ?? null
}

// Baths: 2 → { full: 2, half: 0 } | 2.5 → { full: 2, half: 1 }
function normalizeBaths(raw) {
  if (raw == null) return { full: null, half: null }
  const full = Math.floor(raw)
  const half = raw % 1 >= 0.4 ? 1 : 0
  return { full, half }
}

// Dirección: la street viene de la tarjeta; city/state/zip desde commAddress ("Jefferson, GA 30549")
function parseCommAddress(commAddress) {
  if (!commAddress) return { city: null, state: null, zip: null }
  const match = commAddress.match(/^([^,]+),\s*([A-Z]{2})\s+(\d{5})$/)
  if (!match) return { city: commAddress, state: null, zip: null }
  return { city: match[1].trim(), state: match[2], zip: match[3] }
}

function normalizeHome(card, meta) {
  const { stateSlug, areaSlug, communitySlug, commCoordsLat, commCoordsLng, commAddress, scrapedAt, sourceUrl } = meta

  const id = slugFromHref(card.href) ?? card.lotNumber ?? null
  const { city, state, zip } = parseCommAddress(commAddress)

  const homeSourceUrl = card.href
    ? `https://www.drhorton.com${card.href}`
    : sourceUrl

  // status: 'available' = tiene href; 'under-contract' explícito en card
  let status = null
  if (card.status === 'available') status = 'move-in-ready'
  else if (card.status === 'under-contract') status = 'under-contract'

  return {
    id,
    address: {
      street: card.street || null,
      city,
      state,
      zip,
    },
    communitySlug,
    areaSlug,
    stateSlug,
    planName: card.planName ?? null,
    price: card.price ?? null,
    originalPrice: card.originalPrice ?? null,
    beds: card.beds ?? null,
    baths: normalizeBaths(card.baths),
    sqft: card.sqft ?? null,
    garage: card.garage ?? null,
    stories: card.stories ?? null,
    status,
    estimatedCompletion: null,
    lotNumber: card.lotNumber ?? null,
    location: {
      lat: commCoordsLat ?? null,
      lng: commCoordsLng ?? null,
    },
    locationPrecision: (commCoordsLat != null && commCoordsLng != null) ? 'city' : null,
    sourceUrl: homeSourceUrl,
    scrapedAt,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Traverse raw files
// ──────────────────────────────────────────────────────────────────────────────

async function collectRawFiles(baseDir, filterStates) {
  const files = []

  let stateDirs
  try {
    stateDirs = await readdir(baseDir)
  } catch {
    return files
  }

  for (const stateDir of stateDirs) {
    // Ignora archivos de progreso/log en el raíz
    const statePath = path.join(baseDir, stateDir)
    const s = await stat(statePath).catch(() => null)
    if (!s?.isDirectory()) continue

    if (filterStates && !filterStates.includes(stateDir)) continue

    const areaDirs = await readdir(statePath).catch(() => [])
    for (const areaDir of areaDirs) {
      const areaPath = path.join(statePath, areaDir)
      const as = await stat(areaPath).catch(() => null)
      if (!as?.isDirectory()) continue

      const commFiles = await readdir(areaPath).catch(() => [])
      for (const file of commFiles) {
        if (!file.endsWith('.json')) continue
        files.push(path.join(areaPath, file))
      }
    }
  }

  return files
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  const rawFiles = await collectRawFiles(RAW_DIR, filterStates)

  if (rawFiles.length === 0) {
    console.log('No se encontraron archivos crudos. Corre crawl.js primero.')
    return
  }

  const allHomes = []
  let totalCommunities = 0
  let totalAvailable = 0
  let totalUnderContract = 0

  for (const file of rawFiles) {
    let raw
    try {
      raw = JSON.parse(await readFile(file, 'utf8'))
    } catch (err) {
      console.warn(`  ⚠ No se pudo leer ${file}: ${err.message}`)
      continue
    }

    totalCommunities++
    const meta = {
      stateSlug: raw.stateSlug,
      areaSlug: raw.areaSlug,
      communitySlug: raw.communitySlug,
      commCoordsLat: raw.commCoordsLat,
      commCoordsLng: raw.commCoordsLng,
      commAddress: raw.commAddress,
      scrapedAt: raw.scrapedAt,
      sourceUrl: raw.sourceUrl,
    }

    for (const card of raw.homes ?? []) {
      const home = normalizeHome(card, meta)
      allHomes.push(home)
      if (card.status === 'available') totalAvailable++
      else if (card.status === 'under-contract') totalUnderContract++
    }
  }

  // Agrupa por estado para mostrar estadísticas
  const byState = {}
  for (const h of allHomes) {
    byState[h.stateSlug] = (byState[h.stateSlug] ?? 0) + 1
  }

  console.log(`\nResumen de normalización:`)
  console.log(`  Archivos procesados : ${rawFiles.length}`)
  console.log(`  Comunidades         : ${totalCommunities}`)
  console.log(`  Casas disponibles   : ${totalAvailable}`)
  console.log(`  Bajo contrato       : ${totalUnderContract}`)
  console.log(`  Total tarjetas      : ${allHomes.length}`)
  console.log(`\nPor estado:`)
  for (const [s, n] of Object.entries(byState)) {
    console.log(`  ${s}: ${n}`)
  }

  if (allHomes.length === 0) return

  const outFile = args.out ?? path.join(OUT_DIR, 'homes-normalized.json')
  await writeFile(outFile, JSON.stringify(allHomes, null, 2), 'utf8')
  console.log(`\n✓ Normalizado → ${outFile}`)

  // Muestra 3 casas de ejemplo
  console.log('\nEjemplos (primeras 3 casas disponibles):')
  allHomes
    .filter(h => h.status === 'move-in-ready')
    .slice(0, 3)
    .forEach((h, i) => console.log(`\n[${i + 1}]`, JSON.stringify(h, null, 2)))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
