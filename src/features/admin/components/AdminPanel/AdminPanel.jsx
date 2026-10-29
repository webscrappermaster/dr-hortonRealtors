import { useState, useEffect } from 'react'
import styles from './AdminPanel.module.css'

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })

function parseLocalDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatUpdatedAt(iso) {
  if (!iso) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso))
}

function AdminPanel({ onLogout }) {
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [promoDeadline, setPromoDeadline] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success' | 'error', msg }

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setWhatsappNumber(data.whatsappNumber ?? '')
        setPromoDeadline(data.promoDeadline ?? '')
        setFacebookUrl(data.facebookUrl ?? '')
        setInstagramUrl(data.instagramUrl ?? '')
        setUpdatedAt(data.updatedAt)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleTest() {
    if (!whatsappNumber) return
    const msg = encodeURIComponent('Test — number configured correctly.')
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)
    const body = {}
    if (whatsappNumber) body.whatsappNumber = whatsappNumber
    if (promoDeadline) body.promoDeadline = promoDeadline
    body.facebookUrl = facebookUrl
    body.instagramUrl = instagramUrl
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setUpdatedAt(data.updatedAt)
        setFeedback({ type: 'success', msg: 'Settings saved successfully.' })
      } else {
        setFeedback({ type: 'error', msg: data.error ?? 'Failed to save settings.' })
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Connection error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    onLogout()
  }

  const previewDate = promoDeadline
    ? dateFormatter.format(parseLocalDate(promoDeadline))
    : null

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loadingMsg}>Loading…</p>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Admin Settings</h1>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Sign out
          </button>
        </header>

        <form onSubmit={handleSave} noValidate>
          {/* WhatsApp number */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>WhatsApp</legend>
            <div className={styles.field}>
              <label htmlFor="wa-number" className={styles.label}>
                Phone number
              </label>
              <p className={styles.hint}>
                Digits only, international format without "+". E.g. 14155551234
              </p>
              <div className={styles.inputRow}>
                <input
                  id="wa-number"
                  type="tel"
                  inputMode="numeric"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                  className={styles.input}
                  placeholder="14155551234"
                  aria-describedby="wa-number-hint"
                />
                <button
                  type="button"
                  className={styles.testBtn}
                  onClick={handleTest}
                  disabled={!whatsappNumber}
                  aria-label="Test WhatsApp number by opening a chat"
                >
                  Test
                </button>
              </div>
              <p id="wa-number-hint" className={styles.hint}>
                {whatsappNumber
                  ? `Will link to wa.me/${whatsappNumber}`
                  : 'WhatsApp buttons will show "coming soon" when empty.'}
              </p>
            </div>
          </fieldset>

          {/* Promo deadline */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Promo deadline</legend>
            <div className={styles.field}>
              <label htmlFor="promo-date" className={styles.label}>
                Date
              </label>
              <input
                id="promo-date"
                type="date"
                value={promoDeadline}
                onChange={e => setPromoDeadline(e.target.value)}
                className={`${styles.input} ${styles.inputDate}`}
              />
              {previewDate && (
                <p className={styles.preview} aria-live="polite">
                  Preview: <em>Shop move-in ready homes by {previewDate}.</em>
                </p>
              )}
            </div>
          </fieldset>

          {/* Social media */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Social media</legend>
            <div className={styles.field}>
              <label htmlFor="fb-url" className={styles.label}>
                Facebook URL
              </label>
              <p className={styles.hint}>
                Must start with https://facebook.com/ or https://www.facebook.com/. Leave empty to hide the icon.
              </p>
              <input
                id="fb-url"
                type="url"
                value={facebookUrl}
                onChange={e => setFacebookUrl(e.target.value.trim())}
                className={styles.input}
                placeholder="https://www.facebook.com/yourpage"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="ig-url" className={styles.label}>
                Instagram URL
              </label>
              <p className={styles.hint}>
                Must start with https://instagram.com/ or https://www.instagram.com/. Leave empty to hide the icon.
              </p>
              <input
                id="ig-url"
                type="url"
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value.trim())}
                className={styles.input}
                placeholder="https://www.instagram.com/yourhandle"
              />
            </div>
          </fieldset>

          {updatedAt && (
            <p className={styles.updatedAt}>
              Last updated: {formatUpdatedAt(updatedAt)}
            </p>
          )}

          {feedback && (
            <p
              className={feedback.type === 'success' ? styles.success : styles.error}
              role={feedback.type === 'error' ? 'alert' : 'status'}
            >
              {feedback.msg}
            </p>
          )}

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default AdminPanel
