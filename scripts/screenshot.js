#!/usr/bin/env node
/**
 * screenshot.js
 *
 * Captura la Home nuestra (dev server) y la Home original (archivo local)
 * en 4 anchos para comparación visual. Resultado en docs/reference/screenshots/.
 *
 * Uso:
 *   # 1) En otra terminal: npm run dev
 *   # 2) node scripts/screenshot.js [--only=ours|original] [--url=http://localhost:5173]
 *
 * Al capturar el original se bloquea TODA petición de red externa para que no
 * se ejecuten GTM, OneTrust, Cloudflare, accessiBe, Vimeo, Facebook SDK, etc.
 */

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const WIDTHS = [1440, 1024, 768, 375]
const OUT_DIR = path.resolve('docs/reference/screenshots')
const ORIGINAL_PATH = path.resolve('docs/reference/original-home/original-home.html')

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => a.replace(/^--/, '').split('=')),
)
const only = args.only                               // 'ours' | 'original'
const oursUrl = args.url || 'http://localhost:5173'

async function captureOurs(browser) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    try {
      await page.goto(oursUrl, { waitUntil: 'networkidle', timeout: 30_000 })
    } catch (err) {
      console.error(`  ✗ ours-${width}: no pude abrir ${oursUrl} (¿está corriendo \`npm run dev\`?)`)
      await context.close()
      throw err
    }
    const out = path.join(OUT_DIR, `ours-${width}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`  ✓ ${out}`)
    await context.close()
  }
}

async function captureOriginal(browser) {
  const fileUrl = pathToFileURL(ORIGINAL_PATH).toString()

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()

    /* Bloqueo total de red externa: solo deja pasar file:// y about:blank.
       Esto corta GTM, OneTrust, Cloudflare, accessiBe, Vimeo, Facebook SDK, fuentes externas, etc. */
    await page.route('**/*', (route) => {
      const url = route.request().url()
      if (url.startsWith('file://') || url.startsWith('about:')) {
        route.continue()
      } else {
        route.abort()
      }
    })

    try {
      await page.goto(fileUrl, { waitUntil: 'load', timeout: 30_000 })
    } catch {
      /* "load" puede fallar porque bloqueamos los scripts que gatillan events;
         con DOM listo basta para pintar. */
    }
    /* Pequeña espera para que CSS layouteen y las imágenes locales dibujen. */
    await page.waitForTimeout(600)

    const out = path.join(OUT_DIR, `original-${width}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`  ✓ ${out}`)
    await context.close()
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  try {
    if (only !== 'original') {
      console.log('→ Capturando nuestra Home…')
      await captureOurs(browser)
    }
    if (only !== 'ours') {
      console.log('→ Capturando Home original…')
      await captureOriginal(browser)
    }
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
