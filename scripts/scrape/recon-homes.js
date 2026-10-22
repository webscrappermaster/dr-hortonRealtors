#!/usr/bin/env node
// Reconocimiento específico de casas disponibles en una comunidad.
// Usa domcontentloaded + scroll progresivo + botón "load more" para capturar
// todas las llamadas a API que el sitio hace al cargar casas disponibles.
//
// Uso: node scripts/scrape/recon-homes.js

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = path.resolve('docs/reference/scraping/raw/recon')

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// Comunidades piloto con casas disponibles
const PAGES = [
  {
    label: 'jackson-landing-homes',
    url: 'https://www.drhorton.com/georgia/atlanta/jefferson/jackson-landing',
  },
  {
    label: 'benteen-reserve-homes',
    url: 'https://www.drhorton.com/georgia/atlanta/atlanta/benteen-reserve',
  },
]

async function captureHomesPage(browser, label, pageUrl, outDir) {
  console.log(`\n→ [${label}] ${pageUrl}`)
  const context = await browser.newContext()
  const page = await context.newPage()

  const captured = []

  page.on('response', async (response) => {
    const url = response.url()
    const ct = response.headers()['content-type'] || ''
    if (!ct.includes('application/json') && !ct.includes('text/plain')) return

    let body
    try {
      body = await response.json()
    } catch {
      return
    }

    const entry = { url, status: response.status(), body }
    captured.push(entry)
    console.log(`  json [${response.status()}]: ${url.slice(0, 120)}`)
  })

  try {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 })
  } catch (err) {
    console.warn(`  ⚠ carga inicial: ${err.message.slice(0, 80)}`)
  }

  // Espera a que React hidrate la página
  await sleep(5000)

  // Scroll progresivo para activar lazy-load
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight))
    await sleep(1000)
  }

  // Busca y hace click en botones de "load more" / "show all" / "ver más"
  const loadMoreSelectors = [
    'button:has-text("Load More")',
    'button:has-text("Show All")',
    'button:has-text("View All")',
    'a:has-text("Load More")',
    '[data-testid*="load-more"]',
    '[class*="load-more"]',
    '[class*="loadMore"]',
  ]
  for (const sel of loadMoreSelectors) {
    try {
      const btn = page.locator(sel).first()
      if (await btn.isVisible({ timeout: 2000 })) {
        console.log(`  → click "${sel}"`)
        await btn.click()
        await sleep(3000)
      }
    } catch {
      // selector no encontrado — continuar
    }
  }

  // Espera final para respuestas asíncronas
  await sleep(4000)

  // Guarda archivos
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

  console.log(`  total: ${captured.length} respuestas JSON`)
  await context.close()
  return captured
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  try {
    for (let i = 0; i < PAGES.length; i++) {
      const { label, url } = PAGES[i]
      await captureHomesPage(browser, label, url, OUT_DIR)

      if (i < PAGES.length - 1) {
        const delay = 4000 + Math.random() * 4000
        console.log(`\n  pausa ${Math.round(delay / 1000)}s…`)
        await sleep(delay)
      }
    }
  } finally {
    await browser.close()
  }

  console.log('\n✓ Listo. Archivos en', OUT_DIR)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
