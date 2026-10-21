#!/usr/bin/env node
/**
 * extract-location.js
 *
 * Extrae comunidades de los HTMLs de referencia de D.R. Horton y genera un
 * JSON parcial de StateEntry / AreaEntry / CommunityDetail listo para revisar.
 *
 * Uso:
 *   node scripts/extract-location.js state <html> <stateSlug>
 *     Ej: node scripts/extract-location.js state docs/reference/state-georgia/state-georgia.html georgia
 *
 *   node scripts/extract-location.js area <html> <stateSlug> <areaSlug>
 *     Ej: node scripts/extract-location.js area docs/reference/area-atlanta/area-atlanta.html georgia atlanta
 *
 *   node scripts/extract-location.js community <html>
 *     Ej: node scripts/extract-location.js community docs/reference/community-jackson-landing/community-jackson-landing.html
 *
 * Salida: JSON impreso en stdout.
 * Nota: solo extrae lo que está en el HTML guardado. El modo community extrae
 * gallery, about, amenities, schools, promoSlot, floorPlans y availableHomes.
 */

import { readFileSync } from 'node:fs'

const [, , mode, htmlPath, stateSlug, areaSlug] = process.argv

if (!mode || !htmlPath) {
  console.error('Uso: node scripts/extract-location.js <state|area|community> <html> [stateSlug] [areaSlug]')
  process.exit(1)
}

if ((mode === 'state' || mode === 'area') && !stateSlug) {
  console.error('Se necesita stateSlug para modos state y area')
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

/* Extrae coordenadas del JSON-LD de la página (lat/lng del área o estado).
   Las coordenadas individuales de comunidad no están en el HTML guardado
   (las carga Coveo dinámicamente); solo se extrae el centro del área. */
function extractCenter(html) {
  const latM = /"latitude"\s*:\s*([-\d.]+)/i.exec(html)
  const lngM = /"longitude"\s*:\s*([-\d.]+)/i.exec(html)
  if (latM && lngM) return { lat: Number(latM[1]), lng: Number(lngM[1]) }
  return null
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
      location:          null,
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

/* ── Extracción de detalle de comunidad ─────────────────── */

function extractGallery(html) {
  const items = []
  /* Imágenes del grid principal (desktop), excluye los (1) del carrusel móvil */
  const PHOTO_RE = /class="property-gallery property-photo[^"]*"[^>]*>[\s\S]*?<img[^>]+alt="([^"]*)"[^>]+src="\.\/[^"]*-files\/([^"(]+\.jpg)"/g
  let m
  while ((m = PHOTO_RE.exec(html)) !== null) {
    const [, alt, src] = m
    if (src.includes('(')) continue
    items.push({ type: 'photo', filename: src.replace(/\.(jpe?g|png)$/, '.webp'), alt: alt || '' })
  }
  /* Video */
  const vidM = /property-gallery property-video[^"]*"[^>]*data-url="([^"]+)"[\s\S]*?<img[^>]+alt="([^"]*)"[^>]+src="\.\/[^"]*-files\/([^"(]+\.jpg)"/g.exec(html)
  if (vidM) {
    const [, videoUrl, alt, src] = vidM
    items.push({ type: 'video', filename: src.replace(/\.(jpe?g|png)$/, '.webp'), alt: alt || 'Community video', videoUrl })
  }
  return items
}

function extractAbout(html) {
  const m = /class="community-main-details_about"[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<div class="slide-content[^"]*">([\s\S]*?)<\/div>/i.exec(html)
  if (!m) return null
  const clean = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return `${clean(m[1])}\n\n${clean(m[2])}`
}

function extractAmenities(html) {
  const block = /<ul class="amenities">([\s\S]*?)<\/ul>/i.exec(html)
  if (!block) return []
  const items = []
  const LI_RE = /<li>([^<]+)<\/li>/g
  let m
  while ((m = LI_RE.exec(block[1])) !== null) items.push(m[1].trim())
  return items
}

function extractSchools(html) {
  const block = /<div class="schoolsDiv">([\s\S]*?)<\/div>/i.exec(html)
  if (!block) return []
  const schools = []
  /* Cada escuela está en un <p>: nombre<br>tipo | grados <span class="distance">N mi.</span> */
  const P_RE = /<p>([\s\S]*?)<\/p>/g
  let m
  while ((m = P_RE.exec(block[1])) !== null) {
    const inner = m[1]
    const name = extractText(inner, /^([^<\n]+)/)
    const type = extractText(inner, /<br>\s*([^<|]+?)\s*<span class="vert-divider">/)
    const grades = extractText(inner, /vert-divider">\|<\/span>\s*([^<]+?)\s*<span class="distance">/)
    const distM = /distance">([\d.]+) mi/.exec(inner)
    schools.push({
      name: name ? name.trim() : null,
      type: type ? type.trim() : null,
      grades: grades ? grades.trim() : null,
      distanceMi: distM ? Number(distM[1]) : null,
    })
  }
  return schools
}

function extractPromo(html) {
  const m = /<div class="promo[^"]*"[\s\S]*?<img src="\.\/[^"]*-files\/([^"(]+\.jpg)"[^>]*>[\s\S]*?<span class="promo-title">([^<]+)<\/span>[\s\S]*?<span class="promo-desc">([^<]+)<\/span>(?:[\s\S]*?<span class="promo-disclaimer">([^<]+)<\/span>)?/i.exec(html)
  if (!m) return null
  return {
    image: m[1].replace(/\.(jpe?g|png)$/, '.webp'),
    title: m[2].trim(),
    description: m[3].trim(),
    disclaimer: m[4] ? m[4].trim() : null,
  }
}

function extractLotMap(html) {
  /* El lot map está referenciado solo como botón; la imagen del site map está en la galería
     como Jackson-Landing-PH1-DR-Site-Map-WEB-061325.jpg */
  const m = /community-jackson-landing-files\/(Jackson-Landing[^"]+\.jpg)/.exec(html)
  return m ? m[1].replace(/\.(jpe?g|png)$/, '.webp') : null
}

function extractFloorPlans(html) {
  const block = /<div[^>]*id="floorplans"[^>]*>([\s\S]*?)<\/section>/i.exec(html)
  if (!block) return []
  const plans = []
  const CARD_RE = /<div class="card-content">([\s\S]*?)<\/div>\s*<\/div>\s*<\/a>/g
  let m
  while ((m = CARD_RE.exec(block[1])) !== null) {
    const inner = m[1]
    const name = extractText(inner, /<h2>([^<]+)<\/h2>/)
    const priceRaw = extractText(inner, /<h3>Starting in the\s+\$([\d]+)s<\/h3>/)
    const statsM = /<p class="stats">([\s\S]*?)<\/p>\s*<p class="stats">([\s\S]*?)<\/p>/g.exec(inner)
    const clean = s => s ? s.replace(/<[^>]+>/g, '|').replace(/\|+/g, ' ').trim() : ''
    const line1 = statsM ? clean(statsM[1]) : ''
    const line2 = statsM ? clean(statsM[2]) : ''
    const numM = (str, kw) => { const r = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${kw}`); const x = r.exec(str); return x ? Number(x[1]) : null }
    plans.push({
      name: name || null,
      priceFrom: priceRaw ? Number(priceRaw) * 1000 : null,
      beds: numM(line1, 'Bed'),
      baths: numM(line1, 'Bath'),
      garages: numM(line1, 'Garage'),
      stories: numM(line2, 'Story'),
      sqft: numM(line2, 'Sq'),
      image: null,
    })
  }
  return plans
}

function extractAvailableHomes(html) {
  /* Usa el JSON embebido en el script de SortQmis, que tiene todos los QMIs */
  const m = /var model = (\{[\s\S]*?\});\s*var apiUrl/.exec(html)
  if (!m) return []
  try {
    const model = JSON.parse(m[1])
    return (model.Items || []).map(item => ({
      address: item.Address || null,
      cityStateZip: item.CityStateZip || null,
      planName: item.PlanName ? item.PlanName.replace(/Express$/i, '').trim() : null,
      price: item.Status === 'Under Contract' ? null : item.Price || null,
      wasPrice: item.OriginalPrice || null,
      beds: item.NumberOfBedrooms || null,
      baths: item.NumberOfBathrooms || null,
      garages: item.NumberOfGarages || null,
      stories: item.NumberOfStories || null,
      sqft: item.SquareFootage || null,
      lot: item.LotNumber || null,
      status: item.Status === 'Under Contract' ? 'under-contract' : 'available',
      isRte: !!(item.QmiBadge && item.QmiBadge.Text),
      image: null,
    }))
  } catch {
    return []
  }
}

function extractCommunityDetail(html) {
  return {
    gallery: extractGallery(html),
    about: extractAbout(html),
    amenities: extractAmenities(html),
    schools: extractSchools(html),
    lotMapFilename: extractLotMap(html),
    promoSlot: extractPromo(html),
    floorPlans: extractFloorPlans(html),
    availableHomes: extractAvailableHomes(html),
  }
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
      center: null,
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
    center: extractCenter(html),
    cities: [...new Set(communities.map(c => c.citySlug))],
    communities,
  }
  console.log(JSON.stringify(result, null, 2))
} else if (mode === 'community') {
  const result = extractCommunityDetail(html)
  console.log(JSON.stringify(result, null, 2))
} else {
  console.error('Modo desconocido. Usa: state | area | community')
  process.exit(1)
}
