#!/usr/bin/env node
// Parche de imágenes: añade cardImageRemoteUrl a comunidades que no la tienen.
//
// Flujo:
//   1. Para cada área de statesIndex sin _area.json en raw/, pide
//      /api/comms/direct/<state>/<area>, guarda el JSON y aplica pausa.
//   2. Con los _area.json disponibles, parchea los JSONs de estados:
//      - Si cardImageRemoteUrl es null/ausente, lo llena desde commImageLink.
//      - Si cardImage está definido (imagen local) solo llena el campo remoto
//        de respaldo — nunca reemplaza.
//   3. Reporta cobertura final.
//
// Uso: node scripts/scrape/patch-images.js

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { statesIndex } from '../../src/features/locations/data/statesIndex.js'

const RAW_DIR    = path.resolve('docs/reference/scraping/raw')
const STATES_DIR = path.resolve('src/features/locations/data/states')
const BASE_URL   = 'https://www.drhorton.com'

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

function randomDelay() {
  return 12000 + Math.random() * 8000 // 12–20 s
}

function parseCommPageLink(link) {
  if (!link) return null
  const parts = link.replace(/^\//, '').split('/')
  if (parts.length < 4) return null
  return { stateSlug: parts[0], areaSlug: parts[1], citySlug: parts[2], commSlug: parts[3] }
}

// ── Fetch _area.json para un área ───────────────────────────────────────────

async function fetchAreaJson(stateSlug, areaSlug) {
  const url = `${BASE_URL}/api/comms/direct/${stateSlug}/${areaSlug}`
  console.log(`  → GET ${url}`)
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${url}`)
  return res.json()
}

// ── Construye mapa commSlug → commImageLink para un área ────────────────────

function buildImageMap(areaJson) {
  const map = {}
  for (const cd of areaJson?.CommunityData ?? []) {
    if (!cd.commPageLink || !cd.commImageLink) continue
    const parsed = parseCommPageLink(cd.commPageLink)
    if (parsed?.commSlug) {
      map[parsed.commSlug] = `${BASE_URL}${cd.commImageLink}`
    }
  }
  return map
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  await mkdir(RAW_DIR, { recursive: true })

  // Reúne todas las áreas definidas en statesIndex
  const allAreas = statesIndex.flatMap(s =>
    (s.markets ?? []).map(m => ({ stateSlug: s.slug, areaSlug: m.slug }))
  )

  // Paso 1 — Fetch de áreas sin _area.json
  let fetched = 0
  for (const { stateSlug, areaSlug } of allAreas) {
    const areaJsonPath = path.join(RAW_DIR, stateSlug, areaSlug, '_area.json')
    if (existsSync(areaJsonPath)) continue

    // Solo intentamos si hay un directorio de área (comunidades ya scrapeadas)
    const areaDir = path.join(RAW_DIR, stateSlug, areaSlug)
    if (!existsSync(areaDir)) continue

    console.log(`\n  Falta _area.json para ${stateSlug}/${areaSlug}`)
    try {
      if (fetched > 0) {
        const ms = randomDelay()
        console.log(`  Pausa ${(ms / 1000).toFixed(1)} s…`)
        await delay(ms)
      }
      const data = await fetchAreaJson(stateSlug, areaSlug)
      await writeFile(areaJsonPath, JSON.stringify(data, null, 2), 'utf8')
      console.log(`  ✓ Guardado ${areaJsonPath} (${data.CommunityData?.length ?? 0} comunidades)`)
      fetched++
    } catch (err) {
      console.error(`  ✗ Error en ${stateSlug}/${areaSlug}: ${err.message}`)
    }
  }

  if (fetched > 0) console.log(`\n✓ ${fetched} _area.json nuevos descargados`)
  else console.log('\n— Todos los _area.json ya existían')

  // Paso 2 — Parche de cardImageRemoteUrl en los JSONs de estados

  console.log('\nParcheando state JSONs con cardImageRemoteUrl…')
  let patchedTotal = 0

  const stateSlugs = (await readdir(STATES_DIR).catch(() => []))
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))

  for (const stateSlug of stateSlugs) {
    const stateFile = path.join(STATES_DIR, `${stateSlug}.json`)
    const stateData = JSON.parse(await readFile(stateFile, 'utf8'))
    let patchedState = 0

    for (const mkt of stateData.markets ?? []) {
      // Carga _area.json para este mercado si existe
      const areaJsonPath = path.join(RAW_DIR, stateSlug, mkt.slug, '_area.json')
      if (!existsSync(areaJsonPath)) continue

      let areaJson
      try { areaJson = JSON.parse(await readFile(areaJsonPath, 'utf8')) } catch { continue }
      const imageMap = buildImageMap(areaJson)

      for (const comm of mkt.communities ?? []) {
        if (comm.cardImageRemoteUrl) continue  // ya tiene imagen remota
        const url = imageMap[comm.slug]
        if (!url) continue
        comm.cardImageRemoteUrl = url
        patchedState++
        patchedTotal++
      }
    }

    if (patchedState > 0) {
      await writeFile(stateFile, JSON.stringify(stateData, null, 2), 'utf8')
      console.log(`  ✓ ${stateSlug}: +${patchedState} imágenes`)
    }
  }

  // Paso 3 — Reporte final

  let totalComms = 0
  let withImage  = 0
  let withLocal  = 0

  for (const stateSlug of stateSlugs) {
    const stateFile = path.join(STATES_DIR, `${stateSlug}.json`)
    const stateData = JSON.parse(await readFile(stateFile, 'utf8'))
    for (const mkt of stateData.markets ?? []) {
      for (const comm of mkt.communities ?? []) {
        totalComms++
        if (comm.cardImage)             withLocal++
        if (comm.cardImage || comm.cardImageRemoteUrl) withImage++
      }
    }
  }

  const noImage = totalComms - withImage
  console.log(`\n✓ Parche completo: +${patchedTotal} cardImageRemoteUrl añadidos`)
  console.log(`\nCobertura de imágenes:`)
  console.log(`  Comunidades totales:       ${totalComms}`)
  console.log(`  Con imagen local (curada): ${withLocal}`)
  console.log(`  Con imagen remota:         ${withImage - withLocal}`)
  console.log(`  Con cualquier imagen:      ${withImage} (${((withImage/totalComms)*100).toFixed(1)}%)`)
  console.log(`  Sin ninguna imagen:        ${noImage}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
