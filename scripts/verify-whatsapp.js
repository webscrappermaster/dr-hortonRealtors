// Verificación Playwright — botón de contacto WhatsApp
// Fases:
//   - Sin número (.env vacío): flotante presente + clic abre aviso
//   - Con número (VITE_WHATSAPP_NUMBER=10000000000): href codificado con dirección, comunidad y precio
// Capturas a 390px y 1440px de una comunidad.

import { chromium } from 'playwright'
import { unlinkSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const ENV_FILE  = resolve(ROOT, '.env')
const BASE      = 'http://localhost:5173'
const TEST_NUM  = '10000000000'

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

async function checkFloatingButton(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[aria-label="Contact us on WhatsApp"]', { timeout: 8000 })

  await check(`${path}: botón flotante visible`, async () => {
    const btn = await page.$('[aria-label="Contact us on WhatsApp"]')
    if (!btn) throw new Error('Botón flotante no encontrado')
  })
}

async function runPhase1(context) {
  console.log('\n──── Fase 1: sin número configurado ────')
  const page = await context.newPage()
  page.setDefaultTimeout(15000)

  for (const path of ['/', '/georgia/atlanta', '/texas/dallas', '/mississippi/jackson/pearl/cedar-lane']) {
    console.log(`\n→ ${path}`)
    await checkFloatingButton(page, path)
  }

  console.log('\n→ Clic sin número abre aviso')
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[aria-label="Contact us on WhatsApp"]', { timeout: 8000 })

  await check('El elemento es <button> (no <a>) cuando no hay número', async () => {
    const tag = await page.$eval('[aria-label="Contact us on WhatsApp"]', el => el.tagName.toLowerCase())
    if (tag !== 'button') throw new Error(`Se esperaba <button>, se encontró <${tag}>`)
  })

  await check('Clic muestra aviso "WhatsApp contact will be available soon"', async () => {
    await page.click('[aria-label="Contact us on WhatsApp"]')
    await page.waitForSelector('p[role="status"]', { timeout: 4000 })
    const text = await page.$eval('p[role="status"]', el => el.textContent)
    if (!text.includes('WhatsApp contact will be available soon'))
      throw new Error(`Texto inesperado: "${text}"`)
  })

  await page.close()
}

async function runPhase2(context) {
  console.log('\n──── Fase 2: número configurado (10000000000) ────')
  const page = await context.newPage()
  page.setDefaultTimeout(15000)

  const communityPath = '/mississippi/jackson/pearl/cedar-lane'
  console.log(`\n→ ${communityPath}`)

  await page.goto(`${BASE}${communityPath}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('h1', { timeout: 12000 })

  await check('Botón flotante es <a> con href wa.me', async () => {
    const el = await page.$('[aria-label="Contact us on WhatsApp"]')
    if (!el) throw new Error('Botón flotante no encontrado')
    const tag = await el.evaluate(n => n.tagName.toLowerCase())
    if (tag !== 'a') throw new Error(`Se esperaba <a>, se encontró <${tag}>`)
    const href = await el.evaluate(n => n.getAttribute('href') ?? '')
    if (!href.includes('wa.me')) throw new Error(`href no contiene wa.me: ${href}`)
  })

  await check('Botón de casa (move-in-ready) tiene href con comunidad y precio codificados', async () => {
    const homeButtons = await page.$$('[class*="whatsappWrap"] a[href*="wa.me"]')
    if (!homeButtons.length) {
      // Puede no haber casas move-in-ready; solo avisamos
      console.log('    (sin casas move-in-ready — omitido)')
      return
    }
    const href = await homeButtons[0].evaluate(n => n.getAttribute('href') ?? '')
    const decoded = decodeURIComponent(href)

    // Verifica que el mensaje incluye "Cedar Lane" (nombre comunidad)
    if (!decoded.includes('Cedar Lane')) throw new Error('No contiene "Cedar Lane"')

    // Verifica que incluye un precio con formato $X,XXX
    if (!/\$[\d,]+/.test(decoded)) throw new Error('No contiene precio con formato $X,XXX')

    // Verifica que el número es el de prueba
    if (!href.includes(TEST_NUM)) throw new Error(`No usa el número ${TEST_NUM}`)

    console.log(`    (href decodificado: ${decoded.slice(0, 120)}…)`)
  })

  // ── Capturas ────────────────────────────────────────────────────────────
  console.log('\n→ Capturas de pantalla')

  const screenshotDir = resolve(ROOT, 'docs/reference/screenshots')

  for (const { width, label } of [{ width: 390, label: 'mobile' }, { width: 1440, label: 'desktop' }]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${BASE}${communityPath}`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('h1', { timeout: 12000 })
    await page.waitForTimeout(600)
    const screenshotPath = resolve(screenshotDir, `whatsapp-${label}.png`)
    await page.screenshot({ path: screenshotPath, fullPage: false })
    console.log(`  ✓ Captura guardada: docs/reference/screenshots/whatsapp-${label}.png`)
  }

  await page.close()
}

function removeEnv() {
  if (existsSync(ENV_FILE)) {
    unlinkSync(ENV_FILE)
    console.log('  → .env eliminado')
  }
}

async function main() {
  const devRunning = await checkDevServerRunning()
  if (!devRunning) {
    console.error('❌ El servidor de desarrollo no está corriendo en http://localhost:5173')
    console.error('   Ejecuta "npm run dev" y vuelve a correr este script.')
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  // Fase 1: sin número (usa el servidor ya corriendo sin .env)
  removeEnv()
  console.log('\n⚠  Reinicia "npm run dev" si cambias .env — Vite no recarga vars de entorno en caliente.')
  await runPhase1(context)

  // Fase 2: con número — el usuario debe reiniciar el server con el .env
  console.log('\n──────────────────────────────────────────────────────────')
  console.log('  Para la Fase 2, agrega VITE_WHATSAPP_NUMBER=10000000000 a .env')
  console.log('  y reinicia "npm run dev", luego ejecuta este script de nuevo')
  console.log('  con el argumento --fase2')
  console.log('──────────────────────────────────────────────────────────')

  if (process.argv.includes('--fase2')) {
    await runPhase2(context)
    // Elimina el .env de prueba al finalizar
    removeEnv()
    console.log('\n  → Número de prueba eliminado de .env')
  }

  await browser.close()

  if (failed > 0) {
    console.log(`\n⚠ ${failed} verificación(es) fallaron`)
    process.exit(1)
  } else {
    console.log('\n✓ Todas las verificaciones pasaron')
  }
}

async function checkDevServerRunning() {
  try {
    const res = spawnSync('node', ['-e', `
      const http = require('http')
      http.get('http://localhost:5173', r => process.exit(0)).on('error', () => process.exit(1))
    `], { timeout: 5000 })
    return res.status === 0
  } catch {
    return false
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
