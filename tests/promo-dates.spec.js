import { test, expect } from '@playwright/test'

/* Configuraciones de settings para las tres situaciones a verificar */
const BASE = { whatsappNumber: null, facebookUrl: '', instagramUrl: '' }

const ACTIVE_WITH_RANGE = {
  ...BASE,
  promoDeadline: '2099-12-01',
  promoStartDate: '2099-10-09',
}

const ACTIVE_NO_START = {
  ...BASE,
  promoDeadline: '2099-12-01',
  promoStartDate: '',
}

const EXPIRED = {
  ...BASE,
  promoDeadline: '2000-01-01',
  promoStartDate: '',
}

function mockSettings(page, settings) {
  return page.route('/api/settings', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(settings),
    })
  )
}

/* ── Hero ──────────────────────────────────────────────── */

test.describe('Hero — subheading de fecha', () => {
  test('muestra "Shop move-in ready homes by December 1." cuando el deadline está activo', async ({ page }) => {
    await mockSettings(page, ACTIVE_NO_START)
    await page.goto('/')
    await expect(page.locator('h2').filter({ hasText: 'Shop move-in ready homes by' }))
      .toContainText('December 1')
  })

  test('muestra la fecha incluso cuando la promo tiene fecha de inicio', async ({ page }) => {
    await mockSettings(page, ACTIVE_WITH_RANGE)
    await page.goto('/')
    await expect(page.locator('h2').filter({ hasText: 'Shop move-in ready homes by' }))
      .toContainText('December 1')
  })
})

/* ── PromoBar ──────────────────────────────────────────── */

test.describe('PromoBar', () => {
  test('es visible cuando la promo está activa con rango de fechas', async ({ page }) => {
    await mockSettings(page, ACTIVE_WITH_RANGE)
    await page.goto('/')
    const bar = page.locator('[role="complementary"][aria-label="Oferta promocional"]')
    await expect(bar).toBeVisible()
    await expect(bar).toContainText('Oct 9')
    await expect(bar).toContainText('Dec 1')
  })

  test('muestra "Through Dec 1" cuando no hay fecha de inicio', async ({ page }) => {
    await mockSettings(page, ACTIVE_NO_START)
    await page.goto('/')
    const bar = page.locator('[role="complementary"][aria-label="Oferta promocional"]')
    await expect(bar).toBeVisible()
    await expect(bar).toContainText('Through Dec 1')
  })

  test('está oculto cuando la promo expiró', async ({ page }) => {
    await mockSettings(page, EXPIRED)
    await page.goto('/')
    await expect(
      page.locator('[role="complementary"][aria-label="Oferta promocional"]')
    ).toHaveCount(0)
  })
})

/* ── FeatureGrid — tarjeta Red Tag ─────────────────────── */

test.describe('FeatureGrid — tarjeta Red Tag', () => {
  test('muestra el rango de fechas cuando hay start + deadline activos', async ({ page }) => {
    await mockSettings(page, ACTIVE_WITH_RANGE)
    await page.goto('/')
    /* El tileDate aparece dentro de la tarjeta grande (artículo con el video) */
    const tile = page.locator('article').first()
    await expect(tile).toContainText('Oct 9')
    await expect(tile).toContainText('Dec 1')
  })

  test('muestra "Through Dec 1" sin fecha de inicio', async ({ page }) => {
    await mockSettings(page, ACTIVE_NO_START)
    await page.goto('/')
    const tile = page.locator('article').first()
    await expect(tile).toContainText('Through Dec 1')
  })

  test('no muestra fecha cuando la promo expiró', async ({ page }) => {
    await mockSettings(page, EXPIRED)
    await page.goto('/')
    const tile = page.locator('article').first()
    await expect(tile).not.toContainText('Through')
    await expect(tile).not.toContainText('Oct')
  })

  test('el CTA "See deals" enlaza a /red-tag-event (interno)', async ({ page }) => {
    await mockSettings(page, ACTIVE_NO_START)
    await page.goto('/')
    const cta = page.locator('article').first().getByRole('link', { name: /see deals/i })
    await expect(cta).toHaveAttribute('href', '/red-tag-event')
  })
})

/* ── RedTagEventPage ────────────────────────────────────── */

test.describe('RedTagEventPage — hero con fechas', () => {
  test('muestra el rango de fechas cuando está activo con start', async ({ page }) => {
    await mockSettings(page, ACTIVE_WITH_RANGE)
    await page.goto('/red-tag-event')
    /* Usar el class CSS Module del span de dateRange, más específico que un span genérico */
    const dateSpan = page.locator('[class*="dateRange"]')
    await expect(dateSpan).toContainText('Oct 9')
    await expect(dateSpan).toContainText('Dec 1')
  })

  test('no muestra fecha cuando la promo expiró', async ({ page }) => {
    await mockSettings(page, EXPIRED)
    await page.goto('/red-tag-event')
    /* toHaveText retries automáticamente — espera a que el fetch de settings resuelva */
    const dateSpan = page.locator('[class*="dateRange"]')
    await expect(dateSpan).toHaveText('')
  })
})
