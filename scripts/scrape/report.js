#!/usr/bin/env node
// Parte 4 — report.js: genera docs/reference/scraping/REPORT.md desde los crudos y progress.json.
//
// Uso:
//   node scripts/scrape/report.js

import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const RAW_DIR   = path.resolve('docs/reference/scraping/raw')
const OUT_FILE  = path.resolve('docs/reference/scraping/REPORT.md')
const PROG_FILE = path.join(RAW_DIR, 'progress.json')

// ──────────────────────────────────────────────────────────────────────────────
// Recolecta archivos de comunidad (excluye _area.json y archivos de control)
// ──────────────────────────────────────────────────────────────────────────────

async function collectCommFiles(baseDir) {
  const files = []
  let stateDirs
  try { stateDirs = await readdir(baseDir) } catch { return files }

  for (const stateDir of stateDirs) {
    const statePath = path.join(baseDir, stateDir)
    const s = await stat(statePath).catch(() => null)
    if (!s?.isDirectory()) continue

    const areaDirs = await readdir(statePath).catch(() => [])
    for (const areaDir of areaDirs) {
      const areaPath = path.join(statePath, areaDir)
      const as = await stat(areaPath).catch(() => null)
      if (!as?.isDirectory()) continue

      const commFiles = await readdir(areaPath).catch(() => [])
      for (const file of commFiles) {
        if (!file.endsWith('.json') || file.startsWith('_')) continue
        files.push({ stateDir, areaDir, file, fullPath: path.join(areaPath, file) })
      }
    }
  }

  return files
}

// ──────────────────────────────────────────────────────────────────────────────
// Campos que se rastrean para conteo de nulls (esquema normalizado)
// ──────────────────────────────────────────────────────────────────────────────

const TRACKED_FIELDS = ['street', 'planName', 'price', 'beds', 'baths', 'sqft', 'garage', 'stories', 'lotNumber', 'status']

function countNulls(homes) {
  const counts = Object.fromEntries(TRACKED_FIELDS.map(f => [f, 0]))
  for (const h of homes) {
    if (h.street == null)    counts.street++
    if (h.planName == null)  counts.planName++
    if (h.price == null)     counts.price++
    if (h.beds == null)      counts.beds++
    if (h.baths == null)     counts.baths++
    if (h.sqft == null)      counts.sqft++
    if (h.garage == null)    counts.garage++
    if (h.stories == null)   counts.stories++
    if (h.lotNumber == null) counts.lotNumber++
    if (h.status == null)    counts.status++
  }
  return counts
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(RAW_DIR)) {
    console.error('No existe raw/ — corre crawl.js primero.')
    process.exit(1)
  }

  // Carga progress.json
  let progress = {}
  try { progress = JSON.parse(await readFile(PROG_FILE, 'utf8')) } catch { /* sin progreso */ }

  const commFiles = await collectCommFiles(RAW_DIR)

  // Estadísticas globales
  let totalComms = 0
  let totalHomes = 0
  let totalAvailable = 0
  let totalUnderContract = 0
  const globalNulls = Object.fromEntries(TRACKED_FIELDS.map(f => [f, 0]))

  // Tabla por estado/área/comunidad
  const byState = {}

  for (const { stateDir, areaDir, file, fullPath } of commFiles) {
    let raw
    try { raw = JSON.parse(await readFile(fullPath, 'utf8')) } catch { continue }

    const homes = raw.homes ?? []
    const available  = homes.filter(h => h.status === 'available').length
    const underCont  = homes.filter(h => h.status === 'under-contract').length
    const nullCounts = countNulls(homes)

    totalComms++
    totalHomes        += homes.length
    totalAvailable    += available
    totalUnderContract += underCont

    for (const f of TRACKED_FIELDS) globalNulls[f] += nullCounts[f]

    if (!byState[stateDir]) byState[stateDir] = {}
    if (!byState[stateDir][areaDir]) byState[stateDir][areaDir] = []

    byState[stateDir][areaDir].push({
      slug:          file.replace('.json', ''),
      name:          raw.commName ?? '—',
      homes:         homes.length,
      available,
      underContract: underCont,
      scrapedAt:     raw.scrapedAt ?? '—',
    })
  }

  // URLs bloqueadas / con error
  const blocked = Object.entries(progress)
    .filter(([, v]) => v === 'blocked')
    .map(([k]) => k)
  const errors = Object.entries(progress)
    .filter(([, v]) => v === 'error')
    .map(([k]) => k)

  // ── Genera Markdown ──────────────────────────────────────────────────────────

  const lines = []
  const now = new Date().toISOString()

  lines.push(`# Scraping Report — D.R. Horton`)
  lines.push(``)
  lines.push(`Generado: ${now}`)
  lines.push(``)
  lines.push(`## Resumen global`)
  lines.push(``)
  lines.push(`| Métrica | Valor |`)
  lines.push(`|---|---|`)
  lines.push(`| Comunidades scrapeadas | ${totalComms} |`)
  lines.push(`| Total tarjetas | ${totalHomes} |`)
  lines.push(`| Disponibles (move-in-ready) | ${totalAvailable} |`)
  lines.push(`| Bajo contrato | ${totalUnderContract} |`)
  lines.push(`| URLs bloqueadas (403/429) | ${blocked.length} |`)
  lines.push(`| URLs con error | ${errors.length} |`)
  lines.push(``)

  // Nulls globales
  lines.push(`## Campos con más nulls`)
  lines.push(``)
  lines.push(`| Campo | Nulls | % del total |`)
  lines.push(`|---|---|---|`)
  const sortedNulls = TRACKED_FIELDS
    .map(f => ({ field: f, count: globalNulls[f] }))
    .sort((a, b) => b.count - a.count)
  for (const { field, count } of sortedNulls) {
    const pct = totalHomes > 0 ? ((count / totalHomes) * 100).toFixed(1) : '—'
    lines.push(`| ${field} | ${count} | ${pct}% |`)
  }
  lines.push(``)

  // Detalle por estado / área
  lines.push(`## Detalle por estado`)
  lines.push(``)

  for (const [state, areas] of Object.entries(byState).sort()) {
    const stateHomesTotal = Object.values(areas).flat().reduce((s, c) => s + c.homes, 0)
    lines.push(`### ${state} (${stateHomesTotal} tarjetas)`)
    lines.push(``)

    for (const [area, comms] of Object.entries(areas).sort()) {
      const areaTotal = comms.reduce((s, c) => s + c.homes, 0)
      lines.push(`#### ${area} (${areaTotal} tarjetas)`)
      lines.push(``)
      lines.push(`| Comunidad | Tarjetas | Disponibles | Bajo contrato | Scrapeado |`)
      lines.push(`|---|---|---|---|---|`)
      for (const c of comms.sort((a, b) => a.slug.localeCompare(b.slug))) {
        lines.push(`| ${c.slug} | ${c.homes} | ${c.available} | ${c.underContract} | ${c.scrapedAt.slice(0, 10)} |`)
      }
      lines.push(``)
    }
  }

  // URLs bloqueadas
  if (blocked.length > 0) {
    lines.push(`## URLs bloqueadas (403 / 429)`)
    lines.push(``)
    for (const url of blocked) lines.push(`- \`${url}\``)
    lines.push(``)
  }

  // URLs con error
  if (errors.length > 0) {
    lines.push(`## URLs con error`)
    lines.push(``)
    for (const url of errors) lines.push(`- \`${url}\``)
    lines.push(``)
  }

  await writeFile(OUT_FILE, lines.join('\n'), 'utf8')
  console.log(`✓ Reporte generado → ${OUT_FILE}`)
  console.log(`  Comunidades: ${totalComms} | Tarjetas: ${totalHomes} | Disponibles: ${totalAvailable} | Bajo contrato: ${totalUnderContract}`)
  if (blocked.length) console.log(`  ⚠ Bloqueadas: ${blocked.length}`)
  if (errors.length)  console.log(`  ⚠ Errores:    ${errors.length}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
