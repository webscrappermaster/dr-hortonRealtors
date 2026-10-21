#!/usr/bin/env node
/**
 * add-coords.js
 *
 * Rellena el campo "location" de las comunidades de un JSON de estado usando
 * datos offline de us-zips. Para comunidades con el mismo ZIP aplica un
 * desplazamiento determinista en espiral (ángulo áureo) para que los pines
 * no se encimen.
 *
 * Uso:
 *   node scripts/add-coords.js src/features/locations/data/states/georgia.json
 *
 * El script sobreescribe el archivo original con los datos actualizados.
 * Comunidades sin coincidencia en us-zips quedan con location: null.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const usZips  = require('us-zips')           // { [zip]: { latitude, longitude } }

const [, , jsonPath] = process.argv
if (!jsonPath) {
  console.error('Uso: node scripts/add-coords.js <path/to/state.json>')
  process.exit(1)
}

const stateData = JSON.parse(readFileSync(jsonPath, 'utf-8'))

/* ── Recolectar todas las comunidades ────────────────────── */

const allComms = stateData.markets.flatMap(m => m.communities ?? [])

/* ── Resolución ZIP → coords ─────────────────────────────── */

const resolved = []   // { comm, lat, lng }
const missing  = []   // comunidades sin match

for (const comm of allComms) {
  if (comm.location) continue          // ya tiene coords exactas
  const entry = usZips[comm.zip]
  if (!entry) {
    missing.push(comm)
    continue
  }
  resolved.push({ comm, lat: entry.latitude, lng: entry.longitude })
}

/* ── Agrupar por (lat,lng) y calcular offsets en espiral ──── */
/*    Ángulo áureo 137.508° garantiza distribución uniforme
 *    independientemente de cuántas caigan en el mismo punto.
 *    Radio = 0.007° ≈ 780 m por paso de anillo.               */

const GOLDEN_ANGLE_DEG = 137.508
const STEP_DEG         = 0.007

/** Offset en grados para el elemento i de un grupo. */
function spiralOffset(i) {
  if (i === 0) return { dlat: 0, dlng: 0 }
  const angle  = (i * GOLDEN_ANGLE_DEG * Math.PI) / 180
  const radius = STEP_DEG * Math.ceil(i / 4)
  return {
    dlat: radius * Math.cos(angle),
    dlng: radius * Math.sin(angle),
  }
}

/* Agrupar por clave "lat,lng" */
const groups = new Map()
for (const item of resolved) {
  const key = `${item.lat},${item.lng}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(item)
}

/* Ordenar cada grupo por slug (determinista) y aplicar offset */
for (const group of groups.values()) {
  group.sort((a, b) => a.comm.slug.localeCompare(b.comm.slug))
  group.forEach(({ comm, lat, lng }, i) => {
    const { dlat, dlng } = spiralOffset(i)
    comm.location = {
      lat: Number((lat + dlat).toFixed(6)),
      lng: Number((lng + dlng).toFixed(6)),
      locationPrecision: 'city',
    }
  })
}

/* ── Serializar ──────────────────────────────────────────── */

writeFileSync(jsonPath, JSON.stringify(stateData, null, 2), 'utf-8')

/* ── Reporte ─────────────────────────────────────────────── */

const withPin = allComms.filter(c => c.location)
console.log(`\n✓ ${withPin.length}/${allComms.length} comunidades con pin`)

if (missing.length) {
  console.log(`\n✗ Sin coordenadas (ZIP no encontrado):`)
  for (const c of missing) {
    console.log(`  ${c.slug}  ZIP ${c.zip}  (${c.cityName})`)
  }
} else {
  console.log('  Todas las comunidades tienen coordenadas.')
}

/* Resumen de ZIPs compartidos */
const shared = [...groups.values()].filter(g => g.length > 1)
if (shared.length) {
  console.log('\n⚠ ZIPs compartidos (offset aplicado):')
  for (const g of shared) {
    const zip = g[0].comm.zip
    console.log(`  ZIP ${zip}: ${g.map(x => x.comm.slug).join(', ')}`)
  }
}

console.log()
