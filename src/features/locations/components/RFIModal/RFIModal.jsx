import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import useForm from '../../../../hooks/useForm'
import FormField from '../../../../components/ui/Form/FormField'
import FormLayout from '../../../../components/ui/Form/FormLayout'
import { useBodyScrollLock } from '../../../../hooks/useBodyScrollLock'
import { useSiteSettings } from '../../../../hooks/useSiteSettings'
import { buildWhatsAppUrl, buildRFIMessage, buildTourMessage } from '../../../../utils/whatsapp'
import { DISCLAIMER_WA } from '../../../../config/legalTexts'
import styles from './RFIModal.module.css'

const INITIAL = { firstName: '', lastName: '', email: '', phone: '' }
const RULES = {
  firstName: { required: true, requiredMsg: 'Please enter your first name.' },
  lastName:  { required: true, requiredMsg: 'Please enter your last name.' },
  email: {
    required: true,
    requiredMsg: 'Please enter your email.',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMsg: 'Please enter a valid email.',
  },
}

// variant: 'info' (default) | 'tour'
function RFIModal({ communityName, community, variant = 'info', onClose, returnFocusTo }) {
  const dialogRef = useRef(null)
  const { values, errors, submitted, handleChange, handleSubmit, clearValues } = useForm(INITIAL, RULES)
  const { whatsappNumber } = useSiteSettings()

  useBodyScrollLock(true)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => {
      onClose?.()
      returnFocusTo?.current?.focus()
    }
    const handleClickOutside = (e) => {
      if (e.target === dialog) dialog.close()
    }
    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('click', handleClickOutside)
    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('click', handleClickOutside)
    }
  }, [onClose, returnFocusTo])

  const close = () => dialogRef.current?.close()

  // El window.open debe llamarse sincrónicamente dentro del handler del clic
  // para que el navegador lo permita sin bloquearlo como popup.
  const onSubmitSuccess = (formValues) => {
    if (whatsappNumber) {
      const message = variant === 'tour'
        ? buildTourMessage(formValues, community)
        : buildRFIMessage(formValues, community)
      const url = buildWhatsAppUrl(whatsappNumber, message)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    }
    clearValues()
  }

  const modalTitle = variant === 'tour' ? 'Request a Tour' : 'Request Information'

  return createPortal(
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="rfi-modal-title">
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h2 id="rfi-modal-title" className={styles.title}>{modalTitle}</h2>
            {communityName && (
              <p className={styles.subtitle}>{communityName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            className={styles.closeButton}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {submitted ? (
            <div className={styles.thanks}>
              <p className={styles.thanksTitle}>Thank you!</p>
              <p>Your message has been sent via WhatsApp. We&apos;ll be in touch shortly.</p>
              <button type="button" className={styles.doneBtn} onClick={close}>
                Close
              </button>
            </div>
          ) : (
            <FormLayout
              onSubmit={handleSubmit(onSubmitSuccess)}
              columns={2}
              actions={
                <>
                  <button type="submit" className={styles.submitBtn}>
                    Send request
                  </button>
                  <p className={styles.waNotice}>{DISCLAIMER_WA}</p>
                </>
              }
            >
              <FormField
                label="First name"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
                autoComplete="given-name"
              />
              <FormField
                label="Last name"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
                autoComplete="family-name"
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
              />
              <FormField
                label="Phone (optional)"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={handleChange}
                error={errors.phone}
                autoComplete="tel"
              />
            </FormLayout>
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

export default RFIModal
