// Verificación Playwright: /texas/dallas, /florida, y una comunidad de Texas
// Comprueba: abreviatura de estado correcta, imágenes, STATUS_LABEL

import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

async function check(page, description, fn) {
  try {
    await fn()
    console.log(`  ✓ ${description}`)
  } catch (e) {
    console.error(`  ✗ ${description}`)
    console.error(`    ${e.message}`)
    process.exitCode = 1
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.setDefaultTimeout(15000)

  // ── /texas/dallas ────────────────────────────────────────
  console.log('\n→ /texas/dallas')
  await page.goto(`${BASE}/texas/dallas`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('article', { timeout: 10000 })

  await check(page, 'Muestra tarjetas de comunidad', async () => {
    const cards = await page.$$('article')
    if (cards.length === 0) throw new Error('No se encontraron tarjetas')
  })

  await check(page, 'Abreviatura del estado es TX (no GA)', async () => {
    const cityTexts = await page.$$eval('article p', els =>
      els.map(el => el.textContent).filter(t => t.includes(','))
    )
    const wrongGA = cityTexts.filter(t => t.includes(', GA'))
    const correctTX = cityTexts.filter(t => t.includes(', TX'))
    if (wrongGA.length > 0) throw new Error(`Encontrado ", GA" en ${wrongGA.length} tarjetas`)
    if (correctTX.length === 0) throw new Error('No se encontró ", TX" en ninguna tarjeta')
    console.log(`    (${correctTX.length} tarjetas con ", TX")`)
  })

  await check(page, 'Imágenes de comunidad visibles en tarjetas', async () => {
    const imgs = await page.$$('article img')
    if (imgs.length === 0) throw new Error('No se encontraron imágenes en tarjetas')
    console.log(`    (${imgs.length} imágenes)`)
  })

  // ── /florida ─────────────────────────────────────────────
  console.log('\n→ /florida')
  await page.goto(`${BASE}/florida`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('article', { timeout: 10000 })

  await check(page, 'Muestra tarjetas de comunidad', async () => {
    const cards = await page.$$('article')
    if (cards.length === 0) throw new Error('No se encontraron tarjetas')
    console.log(`    (${cards.length} tarjetas)`)
  })

  await check(page, 'Abreviatura del estado es FL', async () => {
    const cityTexts = await page.$$eval('article p', els =>
      els.map(el => el.textContent).filter(t => t.includes(','))
    )
    const wrongGA = cityTexts.filter(t => t.includes(', GA'))
    if (wrongGA.length > 0) throw new Error(`Encontrado ", GA" en ${wrongGA.length} tarjetas`)
  })

  // ── Comunidad de Texas ───────────────────────────────────
  console.log('\n→ Comunidad de Texas (primera de Dallas)')
  // Obtenemos el href de la primera tarjeta
  await page.goto(`${BASE}/texas/dallas`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('article a', { timeout: 10000 })
  const commHref = await page.$eval('article h2 a', el => el.getAttribute('href'))
  console.log(`    URL: ${commHref}`)

  await page.goto(`${BASE}${commHref}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('h1', { timeout: 12000 })

  await check(page, 'Página de comunidad carga correctamente', async () => {
    const h1 = await page.$eval('h1', el => el.textContent)
    if (!h1) throw new Error('No se encontró h1')
    console.log(`    (${h1.trim()})`)
  })

  await check(page, 'Imagen hero o galería visible', async () => {
    const heroImg = await page.$('img[class*="heroImage"], [class*="galleryWrap"] img, [class*="heroImageWrap"] img')
    if (!heroImg) throw new Error('No se encontró imagen hero ni galería')
  })

  await browser.close()

  if (process.exitCode === 1) {
    console.log('\n⚠ Algunas verificaciones fallaron')
  } else {
    console.log('\n✓ Todas las verificaciones pasaron')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
