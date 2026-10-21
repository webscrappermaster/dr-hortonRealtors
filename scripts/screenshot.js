#!/usr/bin/env node
/**
 * screenshot.js
 *
 * Captura nuestra versión (dev server) y la referencia local de una o varias
 * páginas en anchos definidos, para comparación visual. Resultado en docs/reference/screenshots/.
 *
 * Uso:
 *   # En otra terminal: npm run dev
 *   node scripts/screenshot.js [opciones]
 *
 * Opciones:
 *   --pages=a,b,c        Captura referencia + nuestra versión de cada slug (1440 por defecto)
 *   --page=<slug>        Captura solo la referencia guardada docs/reference/<slug>/<slug>.html
 *   --only=ours|original Solo captura una de las dos versiones (con --pages)
 *   --url=http://...     Base URL del dev server (default: http://localhost:5173)
 *   --widths=1440,768    Anchos a capturar (default varía según modo)
 *   --wait-iframes[=ms]  Espera a que los iframes carguen (default 5000 ms)
 *
 * Nombres de salida:
 *   ours-<slug>-<ancho>.png      nuestra versión
 *   original-<slug>-<ancho>.png  referencia local (incluyendo home → original-home-*)
 */

import { chromium } from 'playwright'
import { mkdir, access } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const WIDTHS = [1440, 1024, 768, 375]
const OUT_DIR = path.resolve('docs/reference/screenshots')
const ORIGINAL_HOME_PATH = path.resolve('docs/reference/original-home/original-home.html')

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => a.replace(/^--/, '').split('=')),
)
const only       = args.only                                 // 'ours' | 'original'
const baseUrl    = args.url || 'http://localhost:5173'
const waitIframes = 'wait-iframes' in args
const iframeTimeout = Number(args['wait-iframes']) || 5000
const pageSlug   = args.page                                 // --page=<slug>
const pagesArg   = args.pages                                // --pages=a,b,c
const customWidths = args.widths
  ? args.widths.split(',').map(w => Number(w.trim())).filter(Boolean)
  : null

/* Bloquea toda petición de red externa (GTM, OneTrust, Vimeo, etc.). */
async function blockExternalRequests(page) {
  await page.route('**/*', (route) => {
    const url = route.request().url()
    if (url.startsWith('file://') || url.startsWith('about:')) {
      route.continue()
    } else {
      route.abort()
    }
  })
}

async function captureOurs(browser, slug, pageUrl, widths) {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30_000 })
    } catch (err) {
      console.error(`  ✗ ours-${slug}-${width}: no pude abrir ${pageUrl} (¿está corriendo \`npm run dev\`?)`)
      await context.close()
      throw err
    }

    if (waitIframes) {
      try {
        await page.waitForFunction(() => {
          const frames = Array.from(document.querySelectorAll('iframe'))
          if (!frames.length) return true
          return frames.every(f => f.contentDocument?.readyState === 'complete' || f.getAttribute('src'))
        }, { timeout: iframeTimeout })
      } catch {
        /* timeout alcanzado — seguimos y capturamos de todos modos */
      }
      await page.waitForTimeout(1200)
    }

    const out = path.join(OUT_DIR, `ours-${slug}-${width}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`  ✓ ${out}`)
    await context.close()
  }
}

async function captureRefPage(browser, slug, widths) {
  const htmlPath = path.resolve('docs/reference', slug, `${slug}.html`)
  try {
    await access(htmlPath)
  } catch {
    throw new Error(`No existe ${htmlPath}. ¿El slug "${slug}" está bien escrito?`)
  }
  const fileUrl = pathToFileURL(htmlPath).toString()

  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    await blockExternalRequests(page)

    try {
      await page.goto(fileUrl, { waitUntil: 'load', timeout: 30_000 })
    } catch {
      /* "load" puede fallar porque bloqueamos scripts que gatillan eventos;
         con DOM listo basta para pintar. */
    }
    await page.waitForTimeout(600)

    const out = path.join(OUT_DIR, `original-${slug}-${width}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`  ✓ ${out}`)
    await context.close()
  }
}

/* Modo default: captura la Home (nuestra versión + original guardado). */
async function captureHomeOriginal(browser) {
  const fileUrl = pathToFileURL(ORIGINAL_HOME_PATH).toString()

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    await blockExternalRequests(page)

    try {
      await page.goto(fileUrl, { waitUntil: 'load', timeout: 30_000 })
    } catch { /* ídem captureRefPage */ }
    await page.waitForTimeout(600)

    const out = path.join(OUT_DIR, `original-home-${width}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`  ✓ ${out}`)
    await context.close()
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()

  try {
    /* ── Modo --pages=a,b,c ─────────────────────────────────────── */
    if (pagesArg) {
      const slugs = pagesArg.split(',').map(s => s.trim()).filter(Boolean)
      const widths = customWidths && customWidths.length ? customWidths : [1440]

      for (const slug of slugs) {
        if (only !== 'ours') {
          console.log(`→ Capturando referencia "${slug}"…`)
          await captureRefPage(browser, slug, widths)
        }
        if (only !== 'original') {
          console.log(`→ Capturando nuestra versión de "${slug}"…`)
          await captureOurs(browser, slug, `${baseUrl}/${slug}`, widths)
        }
      }
      return
    }

    /* ── Modo --page=slug (solo referencia) ──────────────────────── */
    if (pageSlug) {
      const widths = customWidths && customWidths.length ? customWidths : [1440]
      console.log(`→ Capturando referencia "${pageSlug}"…`)
      await captureRefPage(browser, pageSlug, widths)
      return
    }

    /* ── Modo default: Home ──────────────────────────────────────── */
    if (only !== 'original') {
      console.log('→ Capturando nuestra Home…')
      await captureOurs(browser, 'home', baseUrl, WIDTHS)
    }
    if (only !== 'ours') {
      console.log('→ Capturando Home original…')
      await captureHomeOriginal(browser)
    }
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
