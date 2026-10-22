#!/usr/bin/env node
// Parte 1 — reconocimiento: escucha respuestas de red en la página de área
// de Atlanta y en la comunidad Jackson Landing; guarda los JSON capturados.
//
// Uso: node scripts/scrape/recon.js

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = path.resolve('docs/reference/scraping/raw/recon')

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const PAGES = [
  {
    label: 'atlanta-area',
    url: 'https://www.drhorton.com/georgia/atlanta',
  },
  {
    label: 'jackson-landing-community',
    url: 'https://www.drhorton.com/georgia/atlanta/jefferson/jackson-landing',
  },
]

async function capturePage(browser, label, pageUrl, outDir) {
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
    await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 60_000 })
  } catch (err) {
    console.warn(`  ⚠ networkidle timeout (${err.message.slice(0, 80)}); continuando con lo capturado hasta ahora`)
  }

  // Scroll para activar lazy-load / "load more"
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2))
    await sleep(1500)
  }
  // Espera final para que lleguen respuestas asíncronas
  await sleep(3000)

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

  console.log(`  total capturado: ${captured.length} respuestas JSON`)
  await context.close()
  return captured
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  try {
    for (let i = 0; i < PAGES.length; i++) {
      const { label, url } = PAGES[i]
      await capturePage(browser, label, url, OUT_DIR)

      if (i < PAGES.length - 1) {
        const delay = 4000 + Math.random() * 4000
        console.log(`\n  pausa ${Math.round(delay / 1000)}s antes de la próxima página…`)
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
