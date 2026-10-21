#!/usr/bin/env node
/**
 * extract-location.js
 *
 * Extrae comunidades de los HTMLs de referencia de D.R. Horton y genera un
 * JSON parcial de StateEntry / AreaEntry listo para revisar y completar.
 *
 * Uso:
 *   node scripts/extract-location.js state <html> <stateSlug>
 *     Ej: node scripts/extract-location.js state docs/reference/state-georgia/state-georgia.html georgia
 *
 *   node scripts/extract-location.js area <html> <stateSlug> <areaSlug>
 *     Ej: node scripts/extract-location.js area docs/reference/area-atlanta/area-atlanta.html georgia atlanta
 *
 * Salida: JSON impreso en stdout. Redirigir a src/features/locations/data/states/<state>.json
 * o revisar y fusionar manualmente.
 *
 * Nota: solo extrae lo que está en el HTML del listado (tarjetas). Los datos de la
 * página de comunidad (address, phone, hours, gallery, floorPlans, etc.) quedan en null.
 */

import { readFileSync } from 'node:fs'

const [, , mode, htmlPath, stateSlug, areaSlug] = process.argv

if (!mode || !htmlPath || !stateSlug) {
  console.error('Uso: node scripts/extract-location.js <state|area> <html> <stateSlug> [areaSlug]')
  process.exit(1)
}

const html = readFileSync(htmlPath, 'utf-8')

/* ── Helpers ─────────────────────────────────────────────── */

function extractText(str, re) {
  const m = re.exec(str)
  return m ? m[1].trim() : null
}

function parsePrice(str) {
  if (!str) return null
  const m = /\$(\d+)s/.exec(str)
  return m ? Number(m[1]) * 1000 : null
}

function parseSqft(str) {
  if (!str) return null
  const m = /From ([\d,]+) sq/.exec(str)
  return m ? Number(m[1].replace(/,/g, '')) : null
}

function parseRange(str) {
  if (!str) return null
  const rangeMatch = /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/.exec(str.trim())
  if (rangeMatch) return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) }
  const single = Number(str.trim())
  return isNaN(single) ? null : { min: single, max: single }
}

function parseStats(raw) {
  if (!raw) return { beds: null, baths: null, garages: null, stories: null }
  const clean = raw.replace(/<[^>]+>/g, '|').replace(/\|+/g, '|').replace(/^\||\|$/g, '')
  const parts = clean.split('|').map(s => s.trim()).filter(Boolean)
  const get = (keyword) => {
    const part = parts.find(p => p.includes(keyword))
    return part ? parseRange(part.replace(keyword, '').trim()) : null
  }
  return {
    beds: get('bed'),
    baths: get('bath'),
    garages: get('garage'),
    stories: get('story'),
  }
}

function mapStatus(raw) {
  if (!raw) return null
  const lower = raw.toLowerCase()
  if (lower.includes('coming soon')) return 'coming-soon'
  if (lower.includes('move-in ready')) return 'move-in-ready'
  return 'now-selling'
}

/* ── Extracción de comunidades ───────────────────────────── */

function extractCommunities(html, filterAreaSlug) {
  const CARD_RE = /<a href="https:\/\/www\.drhorton\.com\/([^/]+)\/([^/]+)\/([^/]+)\/([^"]+)" class="CoveoResultLink"><div class="home-info community">([\s\S]*?)<\/div><\/div><\/a>/g
  const communities = []
  let m

  while ((m = CARD_RE.exec(html)) !== null) {
    const [, state, area, city, comm, inner] = m
    if (filterAreaSlug && area !== filterAreaSlug) continue

    const name    = extractText(inner, /<h2>([^<]+)<\/h2>/)
    const addr    = extractText(inner, /home-info__address">([^<]+)</)
    const price   = extractText(inner, /home-info__from">([^<]+)</)
    const sqftRaw = extractText(inner, /home-info__square-foot">([^<]+)</)
    const imgRaw  = extractText(inner, /src="\.\/(.*?-files\/[^"]+)"/)
    const imgFile = imgRaw ? imgRaw.replace(/^.*-files\//, '') : null
    const homesM  = /(\d+) homes for sale/.exec(inner)
    const statusM = /<span>([^<]+)<\/span><\/div><div class="title/.exec(inner)
    const statsM  = /home-info__stats">([\s\S]*?)<\/div>/.exec(inner)

    const cityName = addr ? addr.replace(/,\s*GA\s*\d+/, '').trim() : null
    const zip      = addr ? (addr.match(/\d{5}/) || [])[0] ?? null : null

    const { beds, baths, garages, stories } = parseStats(statsM ? statsM[1] : null)

    communities.push({
      slug:              comm,
      name,
      stateSlug:         state,
      areaSlug:          area,
      citySlug:          city,
      cityName,
      zip,
      address:           null,
      phone:             null,
      hours:             null,
      series:            null,
      status:            mapStatus(statusM ? statusM[1] : null),
      tag:               null,
      priceFrom:         parsePrice(price),
      availableHomesCount: homesM ? Number(homesM[1]) : null,
      beds,
      baths,
      garages,
      stories,
      sqftFrom:          parseSqft(sqftRaw),
      cardImage:         imgFile ? imgFile.replace(/\.(png|jpe?g)$/, '.webp') : null,
      gallery:           null,
      about:             null,
      amenities:         null,
      schools:           null,
      lotMapUrl:         null,
      promoSlot:         null,
      floorPlans:        null,
      availableHomes:    null,
      relatedMoveIns:    null,
    })
  }

  return communities
}

/* ── Extracción de blurb ─────────────────────────────────── */

function extractBlurb(html) {
  const m = /area-blurb">([\s\S]*?)<\/div>/.exec(html)
  if (!m) return null
  return m[1].trim().replace(/â€™/g, '’').replace(/â€œ/g, '“').replace(/â€/g, '”')
}

function extractH1(html) {
  const m = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : null
}

function extractRadius(html) {
  const m = /within (\d+) miles/.exec(html)
  return m ? Number(m[1]) : null
}

function extractTotal(html) {
  const m = /(\d+) new homes for sale/.exec(html)
  return m ? Number(m[1]) : null
}

/* ── Main ────────────────────────────────────────────────── */

if (mode === 'state') {
  const communities = extractCommunities(html, null)
  const areas = {}
  for (const c of communities) {
    if (!areas[c.areaSlug]) areas[c.areaSlug] = []
    areas[c.areaSlug].push(c)
  }

  const result = {
    slug: stateSlug,
    name: stateSlug.charAt(0).toUpperCase() + stateSlug.slice(1),
    aria: stateSlug.charAt(0).toUpperCase() + stateSlug.slice(1),
    blurb: extractBlurb(html),
    resultsRadiusMiles: extractRadius(html),
    totalResults: extractTotal(html),
    markets: Object.entries(areas).map(([slug, comms]) => ({
      slug,
      name: slug,
      aria: slug,
      stateSlug,
      heroTitle: null,
      blurb: null,
      totalResults: null,
      resultsRadiusMiles: null,
      cities: [...new Set(comms.map(c => c.citySlug))],
      communities: comms,
    })),
  }
  console.log(JSON.stringify(result, null, 2))
} else if (mode === 'area') {
  if (!areaSlug) {
    console.error('Se necesita areaSlug para modo area')
    process.exit(1)
  }
  const communities = extractCommunities(html, areaSlug)
  const result = {
    slug: areaSlug,
    name: areaSlug,
    aria: areaSlug,
    stateSlug,
    heroTitle: extractH1(html),
    blurb: extractBlurb(html),
    totalResults: extractTotal(html),
    resultsRadiusMiles: extractRadius(html),
    cities: [...new Set(communities.map(c => c.citySlug))],
    communities,
  }
  console.log(JSON.stringify(result, null, 2))
} else {
  console.error('Modo desconocido. Usa: state | area')
  process.exit(1)
}
