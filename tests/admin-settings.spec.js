import { test, expect } from '@playwright/test'

/* Valores iniciales que devuelve GET /api/settings al cargar el panel */
const INITIAL = {
  whatsappNumber: '14155550001',
  promoDeadline: '2099-11-01',
  promoStartDate: '2099-10-01',
  facebookUrl: 'https://www.facebook.com/drhortonrealtors',
  instagramUrl: 'https://www.instagram.com/drhortonrealtors/',
  updatedAt: '2099-01-01T00:00:00.000Z',
}

/* Valores que el usuario cambia y guarda */
const UPDATED = {
  whatsappNumber: '14155559999',
  promoDeadline: '2099-12-31',
  promoStartDate: '2099-11-15',
  facebookUrl: 'https://www.facebook.com/drhortonrealtors',
  instagramUrl: 'https://www.instagram.com/drhortonrealtors/',
  updatedAt: '2099-06-01T12:00:00.000Z',
}

/* Respuesta del PUT exitoso */
const PUT_RESPONSE = {
  ok: true,
  saved: {
    whatsappNumber: UPDATED.whatsappNumber,
    promoDeadline: UPDATED.promoDeadline,
    promoStartDate: UPDATED.promoStartDate,
    facebookUrl: UPDATED.facebookUrl,
    instagramUrl: UPDATED.instagramUrl,
    updatedAt: UPDATED.updatedAt,
  },
}

async function setupMocks(page, { getResponse, putResponse }) {
  /* Auth: simular sesión activa para acceder directamente al panel */
  await page.route('/api/admin/session', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true }) })
  )
  await page.route('/api/admin/logout', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  )

  /* GET /api/settings: primera llamada → datos iniciales; segunda → datos post-guardado */
  let getCallCount = 0
  await page.route('/api/settings', r => {
    getCallCount++
    const data = Array.isArray(getResponse) ? (getResponse[getCallCount - 1] ?? getResponse.at(-1)) : getResponse
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) })
  })

  /* PUT /api/admin/settings */
  if (putResponse !== undefined) {
    await page.route('/api/admin/settings', r => {
      if (r.request().method() === 'PUT') {
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(putResponse) })
      } else {
        r.continue()
      }
    })
  }
}

/* ── Test 1: el panel carga los 5 campos desde GET /api/settings ──────── */

test('el panel rellena los 5 campos al cargar', async ({ page }) => {
  await setupMocks(page, { getResponse: INITIAL })
  await page.goto('/admin')

  await expect(page.locator('#wa-number')).toHaveValue(INITIAL.whatsappNumber)
  await expect(page.locator('#promo-start')).toHaveValue(INITIAL.promoStartDate)
  await expect(page.locator('#promo-date')).toHaveValue(INITIAL.promoDeadline)
  await expect(page.locator('#fb-url')).toHaveValue(INITIAL.facebookUrl)
  await expect(page.locator('#ig-url')).toHaveValue(INITIAL.instagramUrl)
})

/* ── Test 2: el PUT envía los 5 campos y el panel recarga del GET ─────── */

test('PUT envía todos los campos y el panel muestra los valores recargados del GET', async ({ page }) => {
  /* Primera llamada GET → datos iniciales; segunda (post-save) → datos actualizados */
  await setupMocks(page, {
    getResponse: [INITIAL, UPDATED],
    putResponse: PUT_RESPONSE,
  })

  /* Capturar el body del PUT para verificar que incluye los 5 campos */
  let capturedBody = null
  page.on('request', req => {
    if (req.url().includes('/api/admin/settings') && req.method() === 'PUT') {
      capturedBody = JSON.parse(req.postData() ?? '{}')
    }
  })

  await page.goto('/admin')

  /* Esperar a que el panel cargue los valores iniciales */
  await expect(page.locator('#wa-number')).toHaveValue(INITIAL.whatsappNumber)

  /* Cambiar deadline y start date */
  await page.locator('#promo-date').fill(UPDATED.promoDeadline)
  await page.locator('#promo-start').fill(UPDATED.promoStartDate)
  /* Cambiar número de WhatsApp */
  await page.locator('#wa-number').fill(UPDATED.whatsappNumber)

  /* Guardar */
  await page.getByRole('button', { name: /save/i }).click()

  /* Esperar mensaje de éxito */
  await expect(page.locator('[role="status"]')).toContainText('saved successfully')

  /* Verificar que el PUT incluyó los 5 campos */
  expect(capturedBody).not.toBeNull()
  expect(capturedBody.whatsappNumber).toBe(UPDATED.whatsappNumber)
  expect(capturedBody.promoDeadline).toBe(UPDATED.promoDeadline)
  expect(capturedBody.promoStartDate).toBe(UPDATED.promoStartDate)
  expect(capturedBody.facebookUrl).toBe(UPDATED.facebookUrl)
  expect(capturedBody.instagramUrl).toBe(UPDATED.instagramUrl)

  /* Verificar que el panel recargó del GET y muestra los valores actualizados */
  await expect(page.locator('#promo-date')).toHaveValue(UPDATED.promoDeadline)
  await expect(page.locator('#promo-start')).toHaveValue(UPDATED.promoStartDate)
  await expect(page.locator('#wa-number')).toHaveValue(UPDATED.whatsappNumber)
})

/* ── Test 3: si el PUT falla, el panel muestra el error y no recarga ──── */

test('si el PUT falla, se muestra el error del servidor', async ({ page }) => {
  await setupMocks(page, {
    getResponse: INITIAL,
    putResponse: undefined,
  })

  /* Sobrescribir con respuesta de error */
  await page.route('/api/admin/settings', r => {
    r.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Storage not configured — check GLOBAL_CONFIG_ID.' }),
    })
  })

  await page.goto('/admin')
  await expect(page.locator('#wa-number')).toHaveValue(INITIAL.whatsappNumber)

  await page.getByRole('button', { name: /save/i }).click()
  await expect(page.locator('[role="alert"]')).toContainText('Storage not configured')

  /* Los campos no deben haber cambiado */
  await expect(page.locator('#wa-number')).toHaveValue(INITIAL.whatsappNumber)
})

/* ── Test 4: las vistas previas usan los valores del formulario ────────── */

test('las vistas previas reflejan los valores del formulario en tiempo real', async ({ page }) => {
  await setupMocks(page, { getResponse: INITIAL })
  await page.goto('/admin')

  /* Cambiar el deadline en el form y verificar que la vista previa se actualiza */
  await page.locator('#promo-date').fill('2099-12-25')

  /* La preview del Hero debe mostrar December 25 */
  await expect(page.locator('[class*="previewList"] dd').nth(0)).toContainText('December 25')

  /* Borrar la start date → la preview de la tarjeta debe mostrar "Through" */
  await page.locator('#promo-start').fill('')
  await expect(page.locator('[class*="previewList"] dd').nth(1)).toContainText('Through')
})
