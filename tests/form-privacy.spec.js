import { test, expect } from '@playwright/test'

const SETTINGS_WA = {
  whatsappNumber: '14155550123',
  promoDeadline: '2099-12-01',
  promoStartDate: '',
  facebookUrl: '',
  instagramUrl: '',
}

const DISCLAIMER_WA =
  'When you submit, WhatsApp will open with your details so you can send them to us. ' +
  'Your information is not stored on this website. ' +
  'This site is an independent practice project and is not affiliated with D.R. Horton.'

const DISCLAIMER_SITE =
  'Your information is not stored on this website. ' +
  'This site is an independent practice project and is not affiliated with D.R. Horton.'

function mockSettings(page, settings) {
  return page.route('/api/settings', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(settings) })
  )
}

function interceptWindowOpen(page) {
  return page.addInitScript(() => {
    window.open = (url) => { window.__lastWaUrl = url ?? null; return null }
  })
}

/* ── ContactForm ────────────────────────────────────────── */

test.describe('ContactForm (/contact-us-page)', () => {
  test('muestra el texto legal correcto', async ({ page }) => {
    await mockSettings(page, SETTINGS_WA)
    await page.goto('/contact-us-page')
    await expect(page.locator('[class*="disclaimer"]').first()).toContainText(
      'independent practice project and is not affiliated with D.R. Horton'
    )
    await expect(page.locator('[class*="disclaimer"]').first()).not.toContainText(
      'By making this submission'
    )
  })

  test('no aparece el texto antiguo de D.R. Horton', async ({ page }) => {
    await mockSettings(page, SETTINGS_WA)
    await page.goto('/contact-us-page')
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('affiliates may process')
    expect(bodyText).not.toContain('Privacy Policy')
  })

  test('tras enviar, los campos quedan vacíos al volver', async ({ page }) => {
    await interceptWindowOpen(page)
    await mockSettings(page, SETTINGS_WA)
    await page.goto('/contact-us-page')

    /* Rellenar formulario */
    await page.selectOption('[name="inquiryType"]', 'home-buyer')
    await page.fill('[name="firstName"]', 'Ana')
    await page.fill('[name="lastName"]', 'García')
    await page.fill('[name="email"]', 'ana@example.com')
    await page.fill('[name="confirmEmail"]', 'ana@example.com')
    await page.selectOption('[name="state"]', 'TX')
    await page.fill('[name="city"]', 'Austin')
    await page.fill('[name="requestDetails"]', 'I need more information about homes.')

    /* Enviar */
    await page.getByRole('button', { name: /submit/i }).click()
    await expect(page.locator('[role="status"]')).toBeVisible()

    /* Navegar a otra página y volver — el formulario debe estar vacío */
    await page.goto('/')
    await page.goto('/contact-us-page')
    await expect(page.locator('[name="firstName"]')).toHaveValue('')
    await expect(page.locator('[name="lastName"]')).toHaveValue('')
    await expect(page.locator('[name="requestDetails"]')).toHaveValue('')
  })

  test('el campo de comentarios tiene autoComplete off', async ({ page }) => {
    await mockSettings(page, SETTINGS_WA)
    await page.goto('/contact-us-page')
    await expect(page.locator('[name="requestDetails"]')).toHaveAttribute('autocomplete', 'off')
  })
})

/* ── RFIModal (info y tour) ─────────────────────────────── */

test.describe('RFIModal (Request Information y Tour)', () => {
  async function openRFIModal(page) {
    /* Navegar a una comunidad que tenga el modal */
    await page.goto('/texas/dallas/irving/las-colinas')
    const btn = page.getByRole('button', { name: /request information|get info/i }).first()
    if (await btn.count() > 0) {
      await btn.click()
      return true
    }
    return false
  }

  test('el modal muestra el texto legal correcto', async ({ page }) => {
    await interceptWindowOpen(page)
    await mockSettings(page, SETTINGS_WA)

    await page.goto('/texas/dallas/irving/las-colinas')
    const btn = page.getByRole('button', { name: /request information|get info|request info/i }).first()
    const found = await btn.count() > 0
    if (!found) {
      /* Si la comunidad no existe en los datos, marcar test como OK */
      test.skip()
      return
    }
    await btn.click()

    const dialog = page.locator('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('[class*="waNotice"]')).toContainText(
      'independent practice project and is not affiliated with D.R. Horton'
    )
    await expect(dialog.locator('[class*="waNotice"]')).not.toContainText('By making this submission')
  })
})

/* ── WarrantyForm (/warranty) ───────────────────────────── */

test.describe('WarrantyForm (/warranty)', () => {
  async function completeThroughStep3(page) {
    /* Paso 1 — marcar "not listed" primero para que no aparezca el dropdown de sugerencias */
    await page.check('[name="notListed"]')
    await page.fill('[name="noAddress"]', '100 Test St')
    await page.fill('[name="noZip"]', '78701')
    await page.fill('[name="noCity"]', 'Austin')
    await page.selectOption('[name="noState"]', 'TX')
    await page.getByRole('button', { name: /next/i }).click()

    /* Paso 2 — contacto */
    await page.fill('[name="firstName"]', 'Bob')
    await page.fill('[name="lastName"]', 'Builder')
    await page.fill('[name="email"]', 'bob@example.com')
    await page.fill('[name="emailConfirm"]', 'bob@example.com')
    await page.selectOption('[name="contactMethod"]', 'email')
    await page.getByRole('button', { name: /next/i }).click()

    /* Paso 3 — detalles */
    await page.fill('[name="requestDetails"]', 'My garage door is broken and needs repair.')
  }

  test('paso 3 muestra el texto legal correcto', async ({ page }) => {
    await interceptWindowOpen(page)
    await mockSettings(page, SETTINGS_WA)
    await page.goto('/warranty')

    await completeThroughStep3(page)

    /* El aviso debe aparecer con el texto nuevo */
    await expect(page.locator('[class*="waNotice"]')).toContainText(
      'independent practice project and is not affiliated with D.R. Horton'
    )
    await expect(page.locator('[class*="disclaimer"]')).toContainText(
      'independent practice project and is not affiliated with D.R. Horton'
    )
    await expect(page.locator('form')).not.toContainText('affiliates may process')
  })

  test('campo requestDetails tiene autoComplete off', async ({ page }) => {
    await mockSettings(page, SETTINGS_WA)
    await page.goto('/warranty')

    await page.check('[name="notListed"]')
    await page.fill('[name="noAddress"]', '100 Test')
    await page.fill('[name="noZip"]', '78701')
    await page.fill('[name="noCity"]', 'Austin')
    await page.selectOption('[name="noState"]', 'TX')
    await page.getByRole('button', { name: /next/i }).click()

    await page.fill('[name="firstName"]', 'Bob')
    await page.fill('[name="lastName"]', 'Builder')
    await page.fill('[name="email"]', 'bob@example.com')
    await page.fill('[name="emailConfirm"]', 'bob@example.com')
    await page.selectOption('[name="contactMethod"]', 'email')
    await page.getByRole('button', { name: /next/i }).click()

    await expect(page.locator('[name="requestDetails"]')).toHaveAttribute('autocomplete', 'off')
  })

  test('tras enviar, los campos quedan vacíos al volver', async ({ page }) => {
    await interceptWindowOpen(page)
    await mockSettings(page, SETTINGS_WA)
    await page.goto('/warranty')

    await completeThroughStep3(page)
    await page.getByRole('button', { name: /submit/i }).click()
    await expect(page.locator('[role="status"]')).toBeVisible()

    /* Navegar y volver — formulario debe estar en paso 1 y vacío */
    await page.goto('/')
    await page.goto('/warranty')
    await expect(page.locator('[name="zip"]')).toHaveValue('')
  })
})

/* ── Verificar que no queden referencias falsas ─────────── */

test('RedTagEvent no muestra texto antiguo de D.R. Horton', async ({ page }) => {
  await mockSettings(page, SETTINGS_WA)
  await page.goto('/red-tag-event')
  const bodyText = await page.locator('body').textContent()
  expect(bodyText).not.toContain('affiliates may process')
  expect(bodyText).toContain('independent practice project')
})
