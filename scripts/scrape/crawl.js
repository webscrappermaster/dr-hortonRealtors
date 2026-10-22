#!/usr/bin/env node
// Parte 2 — crawl.js: recorre comunidades y extrae casas disponibles.
//
// Uso:
//   node scripts/scrape/crawl.js                         # todos los estados
//   node scripts/scrape/crawl.js --states=georgia        # solo Georgia
//   node scripts/scrape/crawl.js --states=georgia,texas  # varios estados
//   node scripts/scrape/crawl.js --states=georgia --limit=5  # max 5 comunidades
//   node scripts/scrape/crawl.js --refresh               # re-scrape aunque exista caché
//
// Salida:
//   raw/{state}/{area}/{community}.json  → respuesta cruda (comunidad + casas)
//   raw/progress.json                   → estado por URL (pending/done/blocked/error)
//   raw/crawl.log                       → log de cada petición

import { chromium } from 'playwright'
import { mkdir, writeFile, readFile, appendFile } from 'node:fs/promises'
import path from 'node:path'
import { statesIndex } from '../../src/features/locations/data/statesIndex.js'

// ──────────────────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────────────────

const RAW_DIR    = path.resolve('docs/reference/scraping/raw')
const PROG_FILE  = path.join(RAW_DIR, 'progress.json')
const LOG_FILE   = path.join(RAW_DIR, 'crawl.log')
const BASE_URL   = 'https://www.drhorton.com'

// Ritmo humano según el prompt
const DELAY_MIN  = 4_000    // ms entre páginas
const DELAY_MAX  = 8_000
const PAUSE_EVERY = 50      // páginas antes de pausa larga
const PAUSE_LONG = 60_000   // ms de pausa larga
const MAX_RETRIES = 1

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
const limitComms = args.limit ? parseInt(args.limit, 10) : Infinity
const forceRefresh = !!args.refresh

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const randomDelay = () => DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN)

async function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  process.stdout.write(line)
  await appendFile(LOG_FILE, line, 'utf8')
}

async function loadProgress() {
  try {
    return JSON.parse(await readFile(PROG_FILE, 'utf8'))
  } catch {
    return {}
  }
}

async function saveProgress(progress) {
  await writeFile(PROG_FILE, JSON.stringify(progress, null, 2), 'utf8')
}

// Extrae el city-slug desde un commPageLink como "/georgia/atlanta/jefferson/jackson-landing"
function parsePageLink(commPageLink) {
  const parts = commPageLink.replace(/^\//, '').split('/')
  // partes: [state, area, city, community]
  return {
    stateSlug:     parts[0] ?? null,
    areaSlug:      parts[1] ?? null,
    citySlug:      parts[2] ?? null,
    communitySlug: parts[3] ?? null,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Fetchers
// ──────────────────────────────────────────────────────────────────────────────

// Llama al endpoint JSON del área y devuelve CommunityData[]
async function fetchAreaCommunities(browser, stateSlug, areaSlug, progress) {
  const url = `${BASE_URL}/api/comms/direct/${stateSlug}/${areaSlug}`
  const key = `api:${stateSlug}/${areaSlug}`

  if (!forceRefresh && progress[key] === 'done') {
    await log(`SKIP (caché) ${url}`)
    return null
  }

  const start = Date.now()
  const context = await browser.newContext()
  const page = await context.newPage()

  let result = null
  let status = 0

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    status = response?.status() ?? 0

    if (status === 403 || status === 429) {
      await log(`BLOCKED [${status}] ${url}`)
      progress[key] = 'blocked'
      return null
    }

    if (status !== 200) {
      await log(`ERROR [${status}] ${url}`)
      progress[key] = 'error'
      return null
    }

    const body = await response.json()
    result = body

    const elapsed = Date.now() - start
    await log(`OK [${status}] ${elapsed}ms ${url}`)
    progress[key] = 'done'

  } catch (err) {
    await log(`ERROR [${status}] ${url} — ${err.message.slice(0, 100)}`)
    progress[key] = 'error'
  } finally {
    await context.close()
  }

  return result
}

// Extrae .available-home-card del HTML de la página de comunidad
async function fetchCommunityHomes(browser, commPageLink, stateSlug, areaSlug, communitySlug, progress, pageCount) {
  const url = `${BASE_URL}${commPageLink}`
  const key = `html:${stateSlug}/${areaSlug}/${communitySlug}`

  if (!forceRefresh && progress[key] === 'done') {
    await log(`SKIP (caché) ${url}`)
    return null
  }

  // Pausa larga cada PAUSE_EVERY páginas
  if (pageCount.value > 0 && pageCount.value % PAUSE_EVERY === 0) {
    await log(`PAUSA LARGA ${PAUSE_LONG / 1000}s (${pageCount.value} páginas procesadas)`)
    await sleep(PAUSE_LONG)
  }

  const start = Date.now()
  let status = 0
  let homes = null
  let attempts = 0

  while (attempts <= MAX_RETRIES) {
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      status = response?.status() ?? 0

      if (status === 403 || status === 429) {
        await log(`BLOCKED [${status}] ${url}`)
        progress[key] = 'blocked'
        await context.close()
        return null
      }

      if (status !== 200) {
        await log(`ERROR [${status}] ${url}`)
        progress[key] = 'error'
        await context.close()
        if (attempts < MAX_RETRIES) { attempts++; await sleep(randomDelay()); continue }
        return null
      }

      // Espera a que Sitecore hidrate el DOM
      await sleep(4000)

      homes = await page.evaluate(() => {
        function parseCard(card) {
          const href = card.getAttribute('href') || null
          const innerText = card.innerText.replace(/\s+/g, ' ').trim()

          const priceMatch = innerText.match(/^\$?([\d,]+)/)
          const wasMatch = innerText.match(/was \$?([\d,]+)/)
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : null
          const originalPrice = wasMatch ? parseInt(wasMatch[1].replace(/,/g, ''), 10) : null

          const bedsMatch    = innerText.match(/(\d+)\s+Bed/)
          const bathsMatch   = innerText.match(/([\d.]+)\s+Bath/)
          const garageMatch  = innerText.match(/(\d+)\s+Garage/)
          const storiesMatch = innerText.match(/(\d+)\s+Stor/)
          const sqftMatch    = innerText.match(/([\d,]+)\s+Sq\.\s*Ft\./)
          const lotMatch     = innerText.match(/Lot\s+(\w+)/)

          // Dirección: aparece entre "est. payment details" y "N Bed"
          // El patrón del innerText es:
          //   "$X [was $Y] $Z / monthly* *see total est. payment details [How Estimated...] DIRECCIÓN N Bed..."
          const afterDetails = innerText
            .split(/\*see total est\. payment details/i)[1] ?? ''
          const afterHowEst = afterDetails
            .split(/How Estimated/i)[0]
          const street = afterHowEst
            .split(/\d+\s+Bed/)[0]
            .replace(/Under Contract/gi, '')
            .trim()

          const isUnderContract = /under contract/i.test(innerText)
          const planNameMatch = innerText.match(/(\w[\w\s]+?)\s+floor plan/i)

          return {
            href,
            price,
            originalPrice,
            street: street || null,
            beds:    bedsMatch    ? parseInt(bedsMatch[1], 10)    : null,
            baths:   bathsMatch   ? parseFloat(bathsMatch[1])     : null,
            garage:  garageMatch  ? parseInt(garageMatch[1], 10)  : null,
            stories: storiesMatch ? parseInt(storiesMatch[1], 10) : null,
            sqft:    sqftMatch    ? parseInt(sqftMatch[1].replace(/,/g, ''), 10) : null,
            lotNumber: lotMatch ? lotMatch[1] : null,
            planName: planNameMatch ? planNameMatch[1].trim() : null,
            status: isUnderContract ? 'under-contract' : (href ? 'available' : 'unknown'),
          }
        }

        const cards = document.querySelectorAll('.available-home-card')
        return Array.from(cards).map(parseCard)
      })

      await context.close()
      break

    } catch (err) {
      await log(`ERROR [${status}] ${url} — ${err.message.slice(0, 100)}`)
      await context.close()
      if (attempts < MAX_RETRIES) {
        attempts++
        await sleep(randomDelay())
        continue
      }
      progress[key] = 'error'
      return null
    }
  }

  const elapsed = Date.now() - start
  const count = homes?.length ?? 0
  await log(`OK [${status}] ${elapsed}ms ${count} tarjetas ${url}`)
  progress[key] = 'done'
  pageCount.value++

  return homes
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  await mkdir(RAW_DIR, { recursive: true })

  const progress = await loadProgress()
  const browser = await chromium.launch({ headless: true })
  const pageCount = { value: 0 }

  const states = filterStates
    ? statesIndex.filter(s => filterStates.includes(s.slug))
    : statesIndex

  let commProcessed = 0

  try {
    for (const state of states) {
      for (const area of state.markets) {
        if (commProcessed >= limitComms) break

        await log(`\n=== ${state.name} / ${area.name} ===`)

        const areaData = await fetchAreaCommunities(browser, state.slug, area.slug, progress)
        await saveProgress(progress)

        if (!areaData) continue

        const communities = areaData.CommunityData ?? []
        const withHomes = communities.filter(c => c.commAvailableHomes > 0)

        await log(`  ${communities.length} comunidades, ${withHomes.length} con casas disponibles`)

        for (const comm of withHomes) {
          if (commProcessed >= limitComms) break

          const pageLink = comm.commPageLink
          if (!pageLink) continue

          const { stateSlug, areaSlug, citySlug, communitySlug } = parsePageLink(pageLink)
          if (!communitySlug) continue

          // Espera humana entre páginas
          await sleep(randomDelay())

          const homes = await fetchCommunityHomes(
            browser, pageLink, stateSlug, areaSlug, communitySlug, progress, pageCount,
          )
          await saveProgress(progress)

          if (homes === null) continue

          // Guarda el resultado crudo con metadatos
          const outDir = path.join(RAW_DIR, stateSlug, areaSlug)
          await mkdir(outDir, { recursive: true })
          const outFile = path.join(outDir, `${communitySlug}.json`)

          const raw = {
            communitySlug,
            stateSlug,
            areaSlug,
            citySlug,
            commName: comm.commName,
            commCoordsLat: comm.commCoordsLat,
            commCoordsLng: comm.commCoordsLng,
            commAddress: comm.commAddress,
            commSellingStatus: comm.commSellingStatus,
            scrapedAt: new Date().toISOString(),
            sourceUrl: `${BASE_URL}${pageLink}`,
            homes,
          }

          await writeFile(outFile, JSON.stringify(raw, null, 2), 'utf8')
          await log(`  ✓ ${outFile} (${homes.length} tarjetas)`)

          commProcessed++
        }

        if (commProcessed >= limitComms) break
      }

      if (commProcessed >= limitComms) break
    }
  } finally {
    await browser.close()
    await saveProgress(progress)
  }

  await log(`\n✓ Crawl terminado. ${commProcessed} comunidades procesadas.`)
}

main().catch(async err => {
  await appendFile(LOG_FILE, `[${new Date().toISOString()}] FATAL: ${err.message}\n`, 'utf8').catch(() => {})
  console.error(err)
  process.exit(1)
})
