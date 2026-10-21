import { useRef } from 'react'
import useForm from '../../../../hooks/useForm'
import FormField from '../../../../components/ui/Form/FormField'
import FormSelect from '../../../../components/ui/Form/FormSelect'
import { inquiryTypes } from '../../data/inquiryTypes'
import { statesIndex } from '../../../locations/data/statesIndex'
import styles from './ContactForm.module.css'

const STATE_OPTIONS = statesIndex.map(s => ({
  value: s.slug.slice(0, 2).toUpperCase(),
  label: s.name,
}))

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

function ContactForm() {
  const formRef = useRef(null)

  const { values, errors, submitted, handleChange, handleSubmit } = useForm(
    INITIAL,
    {
      inquiryType:    { required: true, requiredMsg: 'Inquiry type is required.' },
      firstName:      { required: true, requiredMsg: 'First name is required.' },
      lastName:       { required: true, requiredMsg: 'Last name is required.' },
      phone: {
        required: false,
        pattern: PHONE_RE,
        patternMsg: 'Please enter a valid phone number.',
      },
      secondaryPhone: {
        required: false,
        pattern: PHONE_RE,
        patternMsg: 'Please enter a valid phone number.',
      },
      email: {
        required: true,
        requiredMsg: 'Email is required.',
        pattern: EMAIL_RE,
        patternMsg: 'Please enter a valid email address.',
      },
      confirmEmail: {
        required: true,
        requiredMsg: 'Please confirm your email.',
      },
      state:          { required: true, requiredMsg: 'State is required.' },
      city:           { required: true, requiredMsg: 'City is required.' },
      requestDetails: {
        required: true,
        requiredMsg: 'Request details are required.',
      },
    }
  )

  function validate(vals) {
    const errs = {}
    if (!vals.inquiryType)   errs.inquiryType   = 'Inquiry type is required.'
    if (!vals.firstName.trim()) errs.firstName  = 'First name is required.'
    if (!vals.lastName.trim())  errs.lastName   = 'Last name is required.'
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
    if (!vals.state)              errs.state          = 'State is required.'
    if (!vals.city.trim())        errs.city           = 'City is required.'
    if (!vals.requestDetails.trim() || vals.requestDetails.trim().length < 10)
      errs.requestDetails = 'Please provide at least 10 characters.'
    return errs
  }

  function onSubmit(e) {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) {
      /* desplazar al primer error */
      const first = formRef.current?.querySelector('[aria-invalid="true"]')
      first?.focus()
      return
    }
    handleSubmit(() => {})()
  }

  if (submitted) {
    return (
      <div className={styles.thanks} role="status" aria-live="polite">
        <h2 className={styles.thanksHeading}>Thank you for contacting us!</h2>
        <p>Your request has been received. Our team will be in touch with you shortly.</p>
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
          options={STATE_OPTIONS}
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
          maxLength={512}
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

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>Submit</button>
      </div>
    </form>
  )
}

export default ContactForm
