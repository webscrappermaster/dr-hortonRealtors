import { useState } from 'react'
import useForm from '../../../../hooks/useForm'
import {
  militaryBranchOptions,
  currentStatusOptions,
  installationsByBranch,
} from '../../data/militaryBenefits'
import styles from './MilitaryBenefitsForm.module.css'

const INITIAL = {
  firstName:     '',
  lastName:      '',
  email:         '',
  phone:         '',
  branch:        '',
  currentStatus: '',
  installation:  '',
}

const RULES = {
  firstName: { required: true, requiredMsg: 'First name is required.' },
  lastName:  { required: true, requiredMsg: 'Last name is required.' },
  email: {
    required: true,
    requiredMsg: 'Email is required.',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMsg: 'Please enter a valid email address.',
  },
  phone: {
    required: true,
    requiredMsg: 'Phone is required.',
    pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
    patternMsg: 'Please enter a valid phone number.',
  },
  branch:    { required: true, requiredMsg: 'Military branch is required.' },
  /* currentStatus: no es obligatorio en el original */
}

const disclaimer =
  'By making this submission, you agree that D.R. Horton and its affiliates may process the personal information you have provided as stated in our Privacy Policy.'

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function Field({ label, name, type = 'text', value, onChange, error, required, placeholder, autoComplete, maxLength }) {
  const errorId = `${name}-error`
  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${styles.input} ${error ? styles.fieldError : ''}`}
      />
      {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
    </div>
  )
}

function Select({ label, name, value, onChange, error, required, options }) {
  const errorId = `${name}-error`
  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${styles.select} ${error ? styles.fieldError : ''}`}
      >
        <option value="">Make a selection</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
    </div>
  )
}

function MilitaryBenefitsForm() {
  const { values, errors, submitted, handleChange, handleSubmit } = useForm(INITIAL, RULES)
  const [installError, setInstallError] = useState('')

  const installOptions = values.branch ? (installationsByBranch[values.branch] ?? []) : []
  const innerSubmit = handleSubmit()

  function handlePhoneChange(e) {
    const formatted = formatPhone(e.target.value)
    handleChange({ target: { name: 'phone', value: formatted } })
  }

  function handleBranchChange(e) {
    handleChange(e)
    /* React 19 batch: ambas actualizaciones se fusionan en un render */
    handleChange({ target: { name: 'installation', value: '' } })
    setInstallError('')
  }

  function onSubmit(e) {
    e.preventDefault()
    if (values.branch && !values.installation) {
      setInstallError('Installation is required.')
      return
    }
    setInstallError('')
    innerSubmit(e)
  }

  if (submitted) {
    return (
      <div className={styles.section}>
        <div className={styles.card}>
          <div className={styles.thankYou} role="status" aria-live="polite">
            <h2 className={styles.thankYouTitle}>Thank you for reaching out!</h2>
            <p>We received your information and a D.R. Horton representative will be in touch with you soon.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.section}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Start the conversation.</h2>
          <p className={styles.cardSubtitle}>
            We&rsquo;re here to help you find the community that fits your needs.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <Field
            label="First name"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
            autoComplete="given-name"
          />
          <Field
            label="Last name"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
            autoComplete="family-name"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            required
            autoComplete="email"
          />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handlePhoneChange}
            error={errors.phone}
            required
            placeholder="(___) ___-____"
            autoComplete="tel"
            maxLength={14}
          />
          <Select
            label="Military branch"
            name="branch"
            value={values.branch}
            onChange={handleBranchChange}
            error={errors.branch}
            required
            options={militaryBranchOptions}
          />
          <Select
            label="Current status"
            name="currentStatus"
            value={values.currentStatus}
            onChange={handleChange}
            error={errors.currentStatus}
            options={currentStatusOptions}
          />
          {values.branch && (
            <Select
              label="Installation options"
              name="installation"
              value={values.installation}
              onChange={handleChange}
              error={installError}
              required
              options={installOptions}
            />
          )}

          <p className={styles.disclaimer}>{disclaimer}</p>

          <div className={styles.submitRow}>
            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MilitaryBenefitsForm
