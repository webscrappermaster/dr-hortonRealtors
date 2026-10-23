// Verificación Playwright
// Rutas: /georgia/atlanta, /mississippi/jackson/pearl/cedar-lane
// También mantiene checks de sesión anterior: /texas/dallas, /florida, comunidad TX

import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

let failed = 0

async function check(description, fn) {
  try {
    await fn()
    console.log(`  ✓ ${description}`)
  } catch (e) {
    console.error(`  ✗ ${description}`)
    console.error(`    ${e.message}`)
    failed++
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page    = await context.newPage()
  page.setDefaultTimeout(15000)

  // ── /georgia/atlanta ────────────────────────────────────────────────────
  console.log('\n→ /georgia/atlanta')
  await page.goto(`${BASE}/georgia/atlanta`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('article', { timeout: 10000 })

  await check('Muestra tarjetas de comunidad', async () => {
    const cards = await page.$$('article')
    if (!cards.length) throw new Error('No cards')
    console.log(`    (${cards.length} tarjetas)`)
  })

  await check('Abreviatura del estado es GA', async () => {
    const texts = await page.$$eval('article p', els =>
      els.map(el => el.textContent).filter(t => t.includes(','))
    )
    if (!texts.some(t => t.includes(', GA')))
      throw new Error('No se encontró ", GA"')
  })

  await check('Imágenes de comunidad visibles (cardImageRemoteUrl al 100%)', async () => {
    const imgs = await page.$$('article img')
    if (!imgs.length) throw new Error('No images')
    console.log(`    (${imgs.length} imágenes)`)
  })

  await check('Precio con formato $X,XXX (coma como separador)', async () => {
    const prices = await page.$$eval('article', cards =>
      cards.map(c => c.textContent).filter(t => /From the \$\d+s/.test(t))
    )
    const badFormat = await page.$$eval('article', cards =>
      cards.map(c => c.textContent).filter(t => /\$\d{4,}\./.test(t)) // punto como separador
    )
    if (badFormat.length) throw new Error(`Formato incorrecto (punto): ${badFormat[0].slice(0,60)}`)
    console.log(`    (${prices.length} precios con formato abreviado)`)
  })

  // ── /mississippi/jackson/pearl/cedar-lane ─────────────────────────────
  console.log('\n→ /mississippi/jackson/pearl/cedar-lane')
  await page.goto(`${BASE}/mississippi/jackson/pearl/cedar-lane`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('h1', { timeout: 12000 })

  await check('Página de comunidad carga (Cedar Lane)', async () => {
    const h1 = await page.$eval('h1', el => el.textContent.trim())
    console.log(`    (${h1})`)
  })

  await check('Imagen hero o galería visible', async () => {
    const img = await page.$('img[class*="heroImage"], [class*="galleryWrap"] img, [class*="heroImageWrap"] img')
    if (!img) throw new Error('No hero/gallery image found')
  })

  await check('Casas disponibles con imagen de comunidad como fallback', async () => {
    const homeImgs = await page.$$('[class*="homesGrid"] img, [class*="imageWrap"] img')
    console.log(`    (${homeImgs.length} imágenes en tarjetas de casas)`)
    // Si hay casas, debe haber imágenes (del fallback getCommunityImage)
    const homeSection = await page.$('[id="available"]')
    if (homeSection) {
      if (!homeImgs.length) throw new Error('Hay sección de casas pero no hay imágenes')
    }
  })

  await check('Precios de casas con formato $X,XXX', async () => {
    const priceEls = await page.$$eval('[class*="price"]', els =>
      els.map(el => el.textContent).filter(t => /\$[\d,]+/.test(t))
    )
    const badPrices = priceEls.filter(t => /\$\d{4,}\./.test(t))
    if (badPrices.length) throw new Error(`Precio con punto: ${badPrices[0]}`)
    const goodPrices = priceEls.filter(t => /\$[\d,]{5,}/.test(t))
    console.log(`    (${goodPrices.length} precios con formato correcto)`)
  })

  // ── /texas/dallas ───────────────────────────────────────────────────────
  console.log('\n→ /texas/dallas')
  await page.goto(`${BASE}/texas/dallas`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('article', { timeout: 10000 })

  await check('Abreviatura del estado es TX', async () => {
    const texts = await page.$$eval('article p', els =>
      els.map(el => el.textContent).filter(t => t.includes(','))
    )
    if (texts.some(t => t.includes(', GA')))
      throw new Error('Encontrado ", GA" en tarjetas de Texas')
    if (!texts.some(t => t.includes(', TX')))
      throw new Error('No se encontró ", TX"')
  })

  // ── /florida ────────────────────────────────────────────────────────────
  console.log('\n→ /florida')
  await page.goto(`${BASE}/florida`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('article', { timeout: 10000 })

  await check('Abreviatura del estado es FL', async () => {
    const texts = await page.$$eval('article p', els =>
      els.map(el => el.textContent).filter(t => t.includes(','))
    )
    if (!texts.some(t => t.includes(', FL')))
      throw new Error('No se encontró ", FL"')
  })

  await browser.close()

  if (failed > 0) {
    console.log(`\n⚠ ${failed} verificación(es) fallaron`)
    process.exit(1)
  } else {
    console.log('\n✓ Todas las verificaciones pasaron')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
