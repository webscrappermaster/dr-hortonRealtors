#!/usr/bin/env node
// Analiza raw/ ya guardados y detecta comunidades donde homes.length != commAvailableHomes.
// Con --fix: resetea esas entradas a 'partial' en progress.json para que se re-scrapen.
//
// Uso:
//   node scripts/scrape/check-counts.js          # solo lista
//   node scripts/scrape/check-counts.js --fix    # resetea a 'partial' en progress.json

import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const RAW_DIR   = path.resolve('docs/reference/scraping/raw')
const PROG_FILE = path.join(RAW_DIR, 'progress.json')

const doFix = process.argv.includes('--fix')

async function main() {
  if (!existsSync(RAW_DIR)) {
    console.log('No existe raw/ todavía — nada que revisar.')
    return
  }

  // Carga progress.json
  let progress = {}
  try { progress = JSON.parse(await readFile(PROG_FILE, 'utf8')) } catch { /* sin progreso */ }

  // Construye mapa commSlug → commAvailableHomes desde los _area.json
  // y también desde el propio archivo de comunidad (nuevo formato con commAvailableHomes)
  const mismatches = []
  let checked = 0

  const stateDirs = await readdir(RAW_DIR).catch(() => [])
  for (const stateDir of stateDirs) {
    const statePath = path.join(RAW_DIR, stateDir)
    const s = await stat(statePath).catch(() => null)
    if (!s?.isDirectory()) continue

    const areaDirs = await readdir(statePath).catch(() => [])
    for (const areaDir of areaDirs) {
      const areaPath = path.join(statePath, areaDir)
      const as = await stat(areaPath).catch(() => null)
      if (!as?.isDirectory()) continue

      // Carga _area.json para obtener commAvailableHomes por slug
      const areaCache = path.join(areaPath, '_area.json')
      const expectedBySlug = {}
      if (existsSync(areaCache)) {
        try {
          const areaData = JSON.parse(await readFile(areaCache, 'utf8'))
          for (const comm of areaData.CommunityData ?? []) {
            if (comm.commPageLink) {
              const slug = comm.commPageLink.split('/').at(-1)
              if (slug) expectedBySlug[slug] = comm.commAvailableHomes ?? null
            }
          }
        } catch { /* área no parseable */ }
      }

      const files = await readdir(areaPath).catch(() => [])
      for (const file of files) {
        if (!file.endsWith('.json') || file.startsWith('_')) continue

        const commSlug = file.replace('.json', '')
        const fullPath = path.join(areaPath, file)

        let raw
        try { raw = JSON.parse(await readFile(fullPath, 'utf8')) } catch { continue }

        const homes = (raw.homes ?? []).length
        // Prefiere commAvailableHomes del propio archivo; si no, del _area.json
        const expected = raw.commAvailableHomes ?? expectedBySlug[commSlug] ?? null

        checked++

        if (expected != null && homes < expected) {
          mismatches.push({ stateDir, areaDir, commSlug, homes, expected })
          const key = `html:${stateDir}/${areaDir}/${commSlug}`
          if (doFix) {
            progress[key] = 'partial'
          }
        }
      }
    }
  }

  console.log(`\nRevisados: ${checked} archivos`)

  if (mismatches.length === 0) {
    console.log('✓ Sin discrepancias — todos los conteos cuadran.')
    return
  }

  console.log(`\n⚠ ${mismatches.length} comunidad(es) con tarjetas < esperadas:`)
  console.log('')
  for (const m of mismatches) {
    console.log(`  ${m.stateDir}/${m.areaDir}/${m.commSlug}`)
    console.log(`    tarjetas guardadas: ${m.homes}  |  esperadas: ${m.expected}`)
  }

  if (doFix) {
    await writeFile(PROG_FILE, JSON.stringify(progress, null, 2), 'utf8')
    console.log(`\n✓ progress.json actualizado — ${mismatches.length} entradas marcadas 'partial'.`)
    console.log('  Corre crawl.js de nuevo para re-scraperarlas.')
  } else {
    console.log(`\nCorre con --fix para marcarlas como 'partial' y que el crawl las reintente.`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
