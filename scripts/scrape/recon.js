#!/usr/bin/env node
// Parte 1 — reconocimiento: escucha respuestas de red en la página de área
// de Atlanta, en la comunidad Jackson Landing y en un QMI individual.
// Guarda los JSON capturados y el DOM de casas disponibles.
//
// Uso: node scripts/scrape/recon.js

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = path.resolve('docs/reference/scraping/raw/recon')

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// Tres páginas de reconocimiento: área, comunidad y QMI individual
const PAGES = [
  {
    label: 'atlanta-area',
    url: 'https://www.drhorton.com/georgia/atlanta',
    // Captura la respuesta JSON /api/comms/direct/georgia/atlanta
  },
  {
    label: 'jackson-landing-community',
    url: 'https://www.drhorton.com/georgia/atlanta/jefferson/jackson-landing',
    // Extrae las tarjetas .available-home-card del HTML inicial (SSR)
    extractDomHomes: true,
  },
  {
    label: 'qmi-195-elsa-court',
    url: 'https://www.drhorton.com/georgia/atlanta/jefferson/jackson-landing/qmis/195-elsa-court',
    // Captura /api/qmis/direct/... y el JSON-LD embebido en el HTML
  },
]

async function capturePage(browser, entry, outDir) {
  const { label, url, extractDomHomes } = entry
  console.log(`\n→ [${label}] ${url}`)
  const context = await browser.newContext()
  const page = await context.newPage()

  const captured = []

  page.on('response', async (response) => {
    const respUrl = response.url()
    const ct = response.headers()['content-type'] || ''
    if (!ct.includes('application/json') && !ct.includes('text/plain')) return

    let body
    try {
      body = await response.json()
    } catch {
      return
    }

    captured.push({ url: respUrl, status: response.status(), body })
    console.log(`  json [${response.status()}]: ${respUrl.slice(0, 120)}`)
  })

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
  } catch (err) {
    console.warn(`  ⚠ ${err.message.slice(0, 80)}`)
  }

  await sleep(5000)

  // Scroll para activar lazy-load si lo hay
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight))
    await sleep(800)
  }
  await sleep(2000)

  // Guarda las respuestas JSON capturadas
  for (let i = 0; i < captured.length; i++) {
    const entry = captured[i]
    const filename = `${label}-${String(i).padStart(3, '0')}.json`
    const outPath = path.join(outDir, filename)
    await writeFile(
      outPath,
      JSON.stringify({ sourceUrl: entry.url, status: entry.status, body: entry.body }, null, 2),
      'utf8',
    )
    console.log(`  ✓ ${filename}`)
  }

  // Si es página de comunidad, extrae DOM de tarjetas de casas y JSON-LD
  if (extractDomHomes) {
    const domData = await page.evaluate(() => {
      function parseCard(card) {
        const href = card.getAttribute('href') || null
        const innerText = card.innerText.replace(/\s+/g, ' ').trim()

        // Extrae precio actual y precio original ("was $X")
        const priceMatch = innerText.match(/\$?([\d,]+)/)
        const wasMatch = innerText.match(/was \$?([\d,]+)/)
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : null
        const originalPrice = wasMatch ? parseInt(wasMatch[1].replace(/,/g, ''), 10) : null

        // Extrae specs desde el patrón "N Bed | N Bath | N Garage"
        const bedsMatch = innerText.match(/(\d+)\s+Bed/)
        const bathsMatch = innerText.match(/([\d.]+)\s+Bath/)
        const garageMatch = innerText.match(/(\d+)\s+Garage/)
        const storiesMatch = innerText.match(/(\d+)\s+Stor/)
        const sqftMatch = innerText.match(/([\d,]+)\s+Sq\.\s*Ft\./)
        const lotMatch = innerText.match(/Lot\s+(\d+)/)

        // Dirección: primera línea después de los precios
        const addressLine = innerText.split('monthly')[1]?.trim().split('\n')[0] || null
        const address = addressLine?.split(/\d+ Bed/)[0]?.trim() || null

        // Status
        const isUnderContract = innerText.toLowerCase().includes('under contract')

        return {
          href,
          price,
          originalPrice,
          address,
          beds: bedsMatch ? parseInt(bedsMatch[1], 10) : null,
          bathsRaw: bathsMatch ? parseFloat(bathsMatch[1]) : null,
          garage: garageMatch ? parseInt(garageMatch[1], 10) : null,
          stories: storiesMatch ? parseInt(storiesMatch[1], 10) : null,
          sqft: sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, ''), 10) : null,
          lotNumber: lotMatch ? lotMatch[1] : null,
          status: isUnderContract ? 'under-contract' : (href ? 'available' : 'unknown'),
          innerText,
        }
      }

      const cards = document.querySelectorAll('.available-home-card')
      const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(s => { try { return JSON.parse(s.textContent) } catch { return null } })
        .filter(Boolean)

      return {
        homeCards: Array.from(cards).map(parseCard),
        jsonLd,
      }
    })

    const domFilename = `${label}-dom-homes.json`
    await writeFile(
      path.join(outDir, domFilename),
      JSON.stringify(domData, null, 2),
      'utf8',
    )
    console.log(`  ✓ ${domFilename} (${domData.homeCards.length} casas)`)
  }

  console.log(`  total JSON capturado: ${captured.length} respuestas`)
  await context.close()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  try {
    for (let i = 0; i < PAGES.length; i++) {
      const entry = PAGES[i]
      await capturePage(browser, entry, OUT_DIR)

      if (i < PAGES.length - 1) {
        const delay = 4000 + Math.random() * 4000
        console.log(`\n  pausa ${Math.round(delay / 1000)}s…`)
        await sleep(delay)
      }
    }
  } finally {
    await browser.close()
  }

  console.log('\n✓ Reconocimiento completo. Revisa docs/reference/scraping/raw/recon/')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
