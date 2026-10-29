import { test, expect } from '@playwright/test'

const SETTINGS_WITH_NUMBER = {
  whatsappNumber: '14155550123',
  promoDeadline: '2099-12-01',
  promoStartDate: '',
  facebookUrl: '',
  instagramUrl: '',
}

const SETTINGS_NO_NUMBER = {
  whatsappNumber: null,
  promoDeadline: '2099-12-01',
  promoStartDate: '',
  facebookUrl: '',
  instagramUrl: '',
}

function mockSettings(page, settings) {
  return page.route('/api/settings', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(settings) })
  )
}

/* Captura window.open sin abrir popups reales — debe llamarse antes de page.goto */
function interceptWindowOpen(page) {
  return page.addInitScript(() => {
    window.__lastWaUrl = null
    window.__waOpened  = false
    window.open = (url) => {
      window.__lastWaUrl = url ?? null
      window.__waOpened  = true
      return null
    }
  })
}

async function fillForm(page, overrides = {}) {
  const data = {
    inquiryType:    'home-buyer',
    firstName:      'Jane',
    lastName:       'Smith',
    phone:          '(415) 555-0100',
    secondaryPhone: '',
    email:          'jane@example.com',
    confirmEmail:   'jane@example.com',
    address:        '123 Main St',
    state:          'TX',
    city:           'Austin',
    requestDetails: "I'm interested in a move-in ready home in the Austin area. Please get in touch.",
    ...overrides,
  }

  await page.selectOption('[name="inquiryType"]', data.inquiryType)
  await page.fill('[name="firstName"]',      data.firstName)
  await page.fill('[name="lastName"]',       data.lastName)
  if (data.phone)          await page.fill('[name="phone"]',          data.phone)
  if (data.secondaryPhone) await page.fill('[name="secondaryPhone"]', data.secondaryPhone)
  await page.fill('[name="email"]',          data.email)
  await page.fill('[name="confirmEmail"]',   data.confirmEmail)
  if (data.address) await page.fill('[name="address"]', data.address)
  await page.selectOption('[name="state"]', data.state)
  await page.fill('[name="city"]',           data.city)
  await page.fill('[name="requestDetails"]', data.requestDetails)

  return data
}

/* ── Test 1: la URL de wa.me contiene los datos codificados ──────────── */

test('al enviar, la URL de wa.me contiene los datos del formulario', async ({ page }) => {
  await interceptWindowOpen(page)        // ← antes de goto
  await mockSettings(page, SETTINGS_WITH_NUMBER)
  await page.goto('/contact-us-page')

  const data = await fillForm(page)
  await page.getByRole('button', { name: /submit/i }).click()

  const capturedUrl = await page.evaluate(() => window.__lastWaUrl)

  expect(capturedUrl).not.toBeNull()
  expect(capturedUrl).toContain('wa.me/14155550123')

  const decoded = decodeURIComponent(capturedUrl.split('?text=')[1] ?? '')
  expect(decoded).toContain('Home Buyer - Sales Inquiries')
  expect(decoded).toContain(`${data.firstName} ${data.lastName}`)
  expect(decoded).toContain(data.email)
  expect(decoded).toContain(data.phone)
  expect(decoded).toContain(data.address)
  expect(decoded).toContain(data.city)
  /* Confirm Email no debe aparecer en el mensaje */
  expect(decoded).not.toContain('Confirm Email')
  expect(decoded).not.toContain('confirmEmail')
})

/* ── Test 2: requestDetails se trunca si supera 1 000 caracteres ────── */

test('requestDetails largos se truncan en la URL de wa.me', async ({ page }) => {
  await interceptWindowOpen(page)
  await mockSettings(page, SETTINGS_WITH_NUMBER)
  await page.goto('/contact-us-page')

  const longMessage = 'A'.repeat(1200)
  await fillForm(page, { requestDetails: longMessage })
  await page.getByRole('button', { name: /submit/i }).click()

  const capturedUrl = await page.evaluate(() => window.__lastWaUrl)
  expect(capturedUrl).not.toBeNull()

  const decoded = decodeURIComponent(capturedUrl.split('?text=')[1] ?? '')
  expect(decoded).toContain('...')
  expect(decoded).not.toContain('A'.repeat(1100))
})

/* ── Test 3: campos opcionales vacíos no aparecen en el mensaje ──────── */

test('los campos vacíos opcionales no aparecen en el mensaje de WhatsApp', async ({ page }) => {
  await interceptWindowOpen(page)
  await mockSettings(page, SETTINGS_WITH_NUMBER)
  await page.goto('/contact-us-page')

  await fillForm(page, { phone: '', secondaryPhone: '', address: '' })
  await page.getByRole('button', { name: /submit/i }).click()

  const capturedUrl = await page.evaluate(() => window.__lastWaUrl)
  expect(capturedUrl).not.toBeNull()

  const decoded = decodeURIComponent(capturedUrl.split('?text=')[1] ?? '')
  expect(decoded).not.toContain('Phone:')
  expect(decoded).not.toContain('Secondary Phone:')
  expect(decoded).not.toContain('Address:')
})

/* ── Test 4: sin número configurado no abre WhatsApp y muestra aviso ── */

test('sin número configurado, no abre WhatsApp y muestra aviso', async ({ page }) => {
  await interceptWindowOpen(page)
  await mockSettings(page, SETTINGS_NO_NUMBER)
  await page.goto('/contact-us-page')

  await expect(page.locator('[class*="waNotice"]')).toContainText('will be available soon')

  await fillForm(page)
  await page.getByRole('button', { name: /submit/i }).click()

  const opened = await page.evaluate(() => window.__waOpened)
  expect(opened).toBe(false)

  /* Aún así muestra la pantalla de agradecimiento */
  await expect(page.locator('[role="status"]')).toBeVisible()
})

/* ── Test 5: validación muestra errores cuando faltan campos ─────────── */

test('mostrar errores de validación sin abrir WhatsApp', async ({ page }) => {
  await interceptWindowOpen(page)
  await mockSettings(page, SETTINGS_WITH_NUMBER)
  await page.goto('/contact-us-page')

  await page.getByRole('button', { name: /submit/i }).click()

  const capturedUrl = await page.evaluate(() => window.__lastWaUrl)
  expect(capturedUrl).toBeNull()

  await expect(page.locator('form[aria-label="Contact us form"]')).toBeVisible()
})
