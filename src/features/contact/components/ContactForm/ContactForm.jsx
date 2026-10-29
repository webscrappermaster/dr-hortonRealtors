import { useState, useRef } from 'react'
import FormField from '../../../../components/ui/Form/FormField'
import FormSelect from '../../../../components/ui/Form/FormSelect'
import { inquiryTypes } from '../../data/inquiryTypes'
import { US_STATES } from '../../../../utils/usStates'
import { useSiteSettings } from '../../../../hooks/useSiteSettings'
import { buildWhatsAppUrl, buildContactMessage } from '../../../../utils/whatsapp'
import styles from './ContactForm.module.css'

const PHONE_RE = /^[\d\s().+-]{7,}$/
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,17}$/

const INITIAL = {
  inquiryType: '',
  firstName: '',
  lastName: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  confirmEmail: '',
  address: '',
  state: '',
  city: '',
  requestDetails: '',
}

function validate(vals) {
  const errs = {}
  if (!vals.inquiryType)            errs.inquiryType    = 'Inquiry type is required.'
  if (!vals.firstName.trim())       errs.firstName      = 'First name is required.'
  if (!vals.lastName.trim())        errs.lastName       = 'Last name is required.'
  if (vals.phone && !PHONE_RE.test(vals.phone))
    errs.phone = 'Please enter a valid phone number.'
  if (vals.secondaryPhone && !PHONE_RE.test(vals.secondaryPhone))
    errs.secondaryPhone = 'Please enter a valid phone number.'
  if (!vals.email.trim()) {
    errs.email = 'Email is required.'
  } else if (!EMAIL_RE.test(vals.email)) {
    errs.email = 'Please enter a valid email address.'
  }
  if (!vals.confirmEmail.trim()) {
    errs.confirmEmail = 'Please confirm your email.'
  } else if (vals.email !== vals.confirmEmail) {
    errs.confirmEmail = 'The emails do not match.'
  }
  if (!vals.state)                  errs.state          = 'State is required.'
  if (!vals.city.trim())            errs.city           = 'City is required.'
  if (!vals.requestDetails.trim() || vals.requestDetails.trim().length < 10)
    errs.requestDetails = 'Please provide at least 10 characters.'
  return errs
}

function ContactForm() {
  const formRef = useRef(null)
  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const { whatsappNumber } = useSiteSettings()

  function handleChange(e) {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
  }

  function onSubmit(e) {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const first = formRef.current?.querySelector('[aria-invalid="true"]')
      first?.focus()
      return
    }

    const inquiryLabel = inquiryTypes.find(t => t.value === values.inquiryType)?.label ?? values.inquiryType
    const waUrl = buildWhatsAppUrl(whatsappNumber, buildContactMessage(values, inquiryLabel))
    if (waUrl) window.open(waUrl, '_blank', 'noopener,noreferrer')

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={styles.thanks} role="status" aria-live="polite">
        <h2 className={styles.thanksHeading}>Thank you for contacting us!</h2>
        {whatsappNumber
          ? <p>WhatsApp has opened with your details. Our team will follow up with you shortly.</p>
          : <p>Your request has been received. Our team will be in touch with you shortly.</p>
        }
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={onSubmit}
      noValidate
      aria-label="Contact us form"
    >
      <h2 className={styles.formTitle}>Contact us</h2>

      <div className={styles.fieldFull}>
        <FormSelect
          label="Inquiry Type"
          name="inquiryType"
          value={values.inquiryType}
          onChange={handleChange}
          error={errors.inquiryType}
          required
          options={inquiryTypes}
          placeholder="Make a selection"
        />
      </div>

      <div className={styles.row}>
        <FormField
          label="First Name"
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
        />
        <FormField
          label="Last Name"
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
        />
      </div>

      <div className={styles.row}>
        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="(___) ___-____"
        />
        <FormField
          label="Secondary Phone"
          name="secondaryPhone"
          type="tel"
          value={values.secondaryPhone}
          onChange={handleChange}
          error={errors.secondaryPhone}
          placeholder="(___) ___-____"
        />
      </div>

      <div className={styles.fieldFull}>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
      </div>

      <div className={styles.fieldFull}>
        <FormField
          label="Confirm Email"
          name="confirmEmail"
          type="email"
          value={values.confirmEmail}
          onChange={handleChange}
          error={errors.confirmEmail}
          required
        />
      </div>

      <div className={styles.fieldFull}>
        <FormField
          label="Address"
          name="address"
          value={values.address}
          onChange={handleChange}
          error={errors.address}
        />
      </div>

      <div className={styles.row}>
        <FormSelect
          label="State"
          name="state"
          value={values.state}
          onChange={handleChange}
          error={errors.state}
          required
          options={US_STATES}
          placeholder="Make a selection"
        />
        <FormField
          label="City"
          name="city"
          value={values.city}
          onChange={handleChange}
          error={errors.city}
          required
        />
      </div>

      <div className={styles.fieldFull}>
        <label htmlFor="requestDetails" className={styles.textareaLabel}>
          Request details <span className={styles.req} aria-hidden="true"> *</span>
          <span className={styles.hint}>(a minimum of 10 characters is required)</span>
        </label>
        <textarea
          id="requestDetails"
          name="requestDetails"
          className={`${styles.textarea} ${errors.requestDetails ? styles.textareaError : ''}`}
          value={values.requestDetails}
          onChange={handleChange}
          rows={5}
          maxLength={2000}
          required
          aria-required="true"
          aria-invalid={errors.requestDetails ? 'true' : undefined}
          aria-describedby={errors.requestDetails ? 'requestDetails-error' : undefined}
        />
        {errors.requestDetails && (
          <p id="requestDetails-error" className={styles.fieldError} role="alert">
            {errors.requestDetails}
          </p>
        )}
      </div>

      <p className={styles.disclaimer}>
        By making this submission, you agree that D.R. Horton and its affiliates may process
        the personal information you have provided as stated in our Privacy Policy.
      </p>

      <p className={styles.waNotice}>
        {whatsappNumber
          ? 'When you submit, WhatsApp will open with your details so you can send them to us.'
          : 'WhatsApp contact will be available soon.'}
      </p>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>Submit</button>
      </div>
    </form>
  )
}

export default ContactForm
