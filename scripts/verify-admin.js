// Verificación Playwright — panel admin + formularios WhatsApp
// Prerequisito: servidor de desarrollo ejecutándose en localhost:5173 (`npm run dev`)
//
// Ejecutar: node scripts/verify-admin.js

import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const COMMUNITY_URL = `${BASE}/georgia/atlanta/atlanta/benteen-reserve`
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

const browser = await chromium.launch()

// ── 1. El sitio carga con valores por defecto cuando /api/settings falla ─────
console.log('\n1. Valores por defecto cuando la API falla')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.route('**/api/settings', route => route.abort())
  await page.goto(`${BASE}/`)
  await page.waitForLoadState('networkidle')

  await check('Hero se renderiza con fecha por defecto cuando la API falla', async () => {
    const h2 = page.locator('h2').first()
    const text = await h2.textContent()
    if (!text.match(/November|December|January|February|March|April|May|June|July|August|September|October/i)) {
      throw new Error(`El subtítulo del hero no contiene un mes: "${text}"`)
    }
  })
  await ctx.close()
}

// ── 2. Cambiar la fecha en los ajustes cambia el texto del hero ───────────────
console.log('\n2. La fecha de la API se refleja en el hero')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.route('**/api/settings', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      whatsappNumber: '10000000000',
      promoDeadline: '2026-12-15',
      updatedAt: null,
    }),
  }))
  await page.goto(`${BASE}/`)
  await page.waitForLoadState('networkidle')

  await check('Hero muestra "December 15" cuando la API responde con 2026-12-15', async () => {
    const h2 = page.locator('h2').first()
    const text = await h2.textContent()
    if (!text.includes('December 15')) {
      throw new Error(`Esperado "December 15" en "${text}"`)
    }
  })
  await ctx.close()
}

// ── 3. /admin sin sesión muestra solo el formulario de login ─────────────────
console.log('\n3. /admin sin sesión activa')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.route('**/api/admin/session', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ authenticated: false }),
  }))
  await page.goto(`${BASE}/admin`)
  await page.waitForLoadState('networkidle')

  await check('/admin sin sesión muestra el campo de contraseña', async () => {
    await page.waitForSelector('#admin-password', { timeout: 5000 })
  })

  await check('/admin sin sesión no muestra el panel de ajustes', async () => {
    const saveBtn = await page.$('button[type="submit"]:not([form])')
    if (saveBtn) {
      const text = await saveBtn.textContent()
      if (text?.includes('Save')) {
        throw new Error('El panel de ajustes no debería ser visible sin sesión')
      }
    }
  })
  await ctx.close()
}

// ── 4. El href de WhatsApp del RFIModal contiene los datos escritos ───────────
console.log('\n4. RFIModal abre WhatsApp con los datos del formulario')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  // Captura las llamadas a window.open antes de que cargue cualquier script
  await page.addInitScript(() => {
    window.__openedUrls = []
    const orig = window.open.bind(window)
    window.open = (url, ...args) => {
      window.__openedUrls.push(String(url))
      return null
    }
  })

  await page.route('**/api/settings', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      whatsappNumber: '14155550100',
      promoDeadline: '2026-11-01',
      updatedAt: null,
    }),
  }))

  await page.goto(COMMUNITY_URL)
  await page.waitForLoadState('networkidle')

  // Abrir el modal "Request a tour"
  const tourBtn = page.locator('button', { hasText: 'Request a tour' }).first()
  await tourBtn.click()
  await page.waitForSelector('#rfi-modal-title', { timeout: 5000 })

  // Rellenar el formulario
  await page.fill('input[name="firstName"]', 'Ana')
  await page.fill('input[name="lastName"]', 'García')
  await page.fill('input[name="email"]', 'ana@example.com')
  await page.fill('input[name="phone"]', '555-1234')

  // Enviar
  await page.click('button[type="submit"]')

  await check('window.open fue llamado al enviar el formulario', async () => {
    await page.waitForFunction(() => window.__openedUrls.length > 0, { timeout: 3000 })
    const urls = await page.evaluate(() => window.__openedUrls)
    if (urls.length === 0) throw new Error('window.open no fue llamado')
  })

  await check('La URL de WhatsApp contiene el número configurado', async () => {
    const urls = await page.evaluate(() => window.__openedUrls)
    const url = urls[0]
    if (!url.includes('14155550100')) {
      throw new Error(`URL no contiene el número: ${url}`)
    }
  })

  await check('La URL de WhatsApp contiene el nombre y email (codificados)', async () => {
    const urls = await page.evaluate(() => window.__openedUrls)
    const url = decodeURIComponent(urls[0])
    if (!url.includes('Ana') || !url.includes('ana@example.com')) {
      throw new Error(`URL no contiene los datos del formulario: ${url.substring(0, 200)}`)
    }
  })

  await ctx.close()
}

await browser.close()

console.log(`\n${failed === 0 ? '✓ Todos los checks pasaron.' : `✗ ${failed} check(s) fallaron.`}`)
process.exit(failed > 0 ? 1 : 0)
