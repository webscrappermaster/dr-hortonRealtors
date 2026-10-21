#!/usr/bin/env node
/**
 * test-legal-modal.js
 * Verifica que los links legales del footer abran <dialog open>.
 * Uso: node scripts/test-legal-modal.js  (dev server en localhost:5173)
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:5173'
const LEGAL_LINKS = [
  'Privacy policy',
  'Terms of use',
  'Your privacy choices',
  'Legal notices',
  'Licensing and state notices',
  'Accessibility',
  'Manage cookies',
]
const WIDTHS = [1440, 900]

let passed = 0
let failed = 0

function log(status, label, detail = '') {
  const icon = status === 'PASS' ? '✓' : '✗'
  console.log(`  ${icon} [${status}] ${label}${detail ? ` — ${detail}` : ''}`)
  if (status === 'PASS') passed++; else failed++
}

async function testWidth(browser, width) {
  console.log(`\n── Viewport ${width}px ───────────────────────────────`)
  const context = await browser.newContext({ viewport: { width, height: 800 } })
  const page = await context.newPage()

  /* Capturar errores de consola del navegador */
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push(`JS error: ${err.message}`))

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 })

  /* Inyectar parche de diagnóstico ANTES de que el usuario haga clic */
  await page.evaluate(() => {
    window.__legalModalOpened = 0
    /* Observar cambios en el DOM para detectar si <dialog> se añade */
    const obs = new MutationObserver(() => {
      if (document.querySelector('dialog')) window.__dialogDetected = true
    })
    obs.observe(document.body, { childList: true, subtree: true })
    window.__obs = obs
  })

  for (const label of LEGAL_LINKS) {
    /* Buscar todos los <a> visibles en el footer con ese texto */
    const trigger = page.locator('footer').getByRole('link', { name: label }).or(
      page.locator('footer').locator('a').filter({ hasText: label })
    ).filter({ visible: true }).first()

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(200)

    let triggerVisible = false
    try {
      triggerVisible = await trigger.isVisible({ timeout: 1000 })
    } catch { /* nada */ }

    if (!triggerVisible) {
      /* Listar todos los <a> en el footer para diagnóstico */
      const allLinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll('footer a')).map(a => ({
          text: a.textContent.trim(),
          visible: a.offsetParent !== null,
          href: a.getAttribute('href'),
        }))
      )
      log('FAIL', `${label} (${width}px)`, `no visible. Links en footer: ${JSON.stringify(allLinks.filter(l => l.visible).map(l => l.text))}`)
      continue
    }

    /* Info del elemento antes de hacer clic */
    const elemInfo = await trigger.evaluate(el => ({
      tag: el.tagName,
      href: el.getAttribute('href'),
      text: el.textContent.trim().slice(0, 40),
      rect: JSON.stringify(el.getBoundingClientRect()),
    }))
    console.log(`     → clicking: <${elemInfo.tag} href="${elemInfo.href}"> "${elemInfo.text}"`)

    await trigger.click()
    await page.waitForTimeout(800)

    /* Estado del DOM */
    const domState = await page.evaluate(() => {
      const dialog = document.querySelector('dialog')
      return {
        dialogInDom: !!dialog,
        dialogOpen: dialog?.open ?? false,
        dialogVisible: dialog ? (() => {
          const r = dialog.getBoundingClientRect()
          return r.width > 0 && r.height > 0
        })() : false,
        modalDetected: !!window.__dialogDetected,
      }
    })

    if (!domState.dialogInDom) {
      log('FAIL', `${label} (${width}px)`, `<dialog> NO en DOM. MutationObserver detects: ${domState.modalDetected}`)
    } else if (!domState.dialogOpen) {
      log('FAIL', `${label} (${width}px)`, `<dialog> en DOM pero NO abierto`)
    } else if (!domState.dialogVisible) {
      log('FAIL', `${label} (${width}px)`, `<dialog open> pero no visible (rect=0)`)
    } else {
      log('PASS', `${label} (${width}px)`, 'dialog[open] visible')

      /* Escape */
      await page.keyboard.press('Escape')
      await page.waitForTimeout(400)
      const stillOpen = await page.evaluate(() => !!document.querySelector('dialog[open]'))
      if (stillOpen) {
        log('FAIL', `${label} (${width}px) — Escape`, 'sigue abierto')
      } else {
        log('PASS', `${label} (${width}px) — Escape`, 'cerrado')
      }
    }

    /* Resetear observer para el siguiente link */
    await page.evaluate(() => { window.__dialogDetected = false })
  }

  if (consoleErrors.length) {
    console.log(`\n  ⚠ Errores de consola (${width}px):`)
    consoleErrors.forEach(e => console.log(`     ${e}`))
  }

  await context.close()
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const width of WIDTHS) {
      await testWidth(browser, width)
    }
  } finally {
    await browser.close()
  }

  console.log(`\n── Resultado ──────────────────────────────────────`)
  console.log(`   PASS: ${passed}   FAIL: ${failed}`)
  if (failed > 0) process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
