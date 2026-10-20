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
 *   # Capturar cualquier referencia guardada en docs/reference/<slug>/<slug>.html
 *   # (red externa bloqueada, 1 ancho = 1440 por defecto). Ejemplos:
 *   #   node scripts/screenshot.js --page=services
 *   #   node scripts/screenshot.js --page=who-we-are --widths=1440,768
 *
 * Al capturar el original (o cualquier --page) se bloquea TODA petición de
 * red externa para que no se ejecuten GTM, OneTrust, Cloudflare, accessiBe,
 * Vimeo, Facebook SDK, etc.
 */

import { chromium } from 'playwright'
import { mkdir, access } from 'node:fs/promises'
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
const waitIframes = 'wait-iframes' in args           // --wait-iframes
const iframeTimeout = Number(args['wait-iframes']) || 5000
const pageSlug = args.page                           // --page=<slug>
const customWidths = args.widths
  ? args.widths.split(',').map(w => Number(w.trim())).filter(Boolean)
  : null

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

    /* --wait-iframes: espera a que el iframe de Vimeo (u otros cross-origin)
       termine de cargar, o hasta `iframeTimeout` ms (default 5000). */
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
      /* Extra: pequeño delay para el primer frame del video */
      await page.waitForTimeout(1200)
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

/* --page=<slug>
   Captura docs/reference/<slug>/<slug>.html con la misma red externa bloqueada
   que la Home original. Por defecto solo captura ancho 1440 (lo necesario para
   contrastar durante el desarrollo); con --widths=1440,768 se puede ampliar. */
async function capturePage(browser, slug) {
  const htmlPath = path.resolve('docs/reference', slug, `${slug}.html`)
  try {
    await access(htmlPath)
  } catch {
    throw new Error(`No existe ${htmlPath}. ¿El slug "${slug}" está bien escrito?`)
  }
  const fileUrl = pathToFileURL(htmlPath).toString()
  const widths = customWidths && customWidths.length ? customWidths : [1440]

  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()

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
      /* mismo motivo que en captureOriginal: scripts bloqueados → "load" puede fallar */
    }
    await page.waitForTimeout(600)

    const out = path.join(OUT_DIR, `ref-${slug}-${width}.png`)
    await page.screenshot({ path: out, fullPage: true })
    console.log(`  ✓ ${out}`)
    await context.close()
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  try {
    if (pageSlug) {
      console.log(`→ Capturando referencia "${pageSlug}"…`)
      await capturePage(browser, pageSlug)
      return
    }
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
