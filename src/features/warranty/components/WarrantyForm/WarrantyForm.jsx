import { useState, useRef, useEffect } from 'react'
import FormField from '../../../../components/ui/Form/FormField'
import FormSelect from '../../../../components/ui/Form/FormSelect'
import styles from './WarrantyForm.module.css'

/* Sugerencias de dirección de ejemplo — no conectan a ningún servicio externo.
   Muestran resultados solo cuando el ZIP tiene 5 dígitos; son claramente ficticias. */
const MOCK_ADDRESSES = [
  '100 Demo Lane, Testville',
  '200 Sample Street, Demo City',
  '300 Example Ave, Mocktown',
  '400 Placeholder Blvd, Sampleburg',
  '500 Test Road, Demoville',
]

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District Of Columbia' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const CONTACT_METHODS = [
  { value: 'home',  label: 'Home Phone' },
  { value: 'cell',  label: 'Cell Phone' },
  { value: 'work',  label: 'Work Phone' },
  { value: 'email', label: 'Email' },
  { value: 'text',  label: 'Text' },
  { value: 'any',   label: 'Use Any Contact Method' },
]

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
const MAX_FILE_MB = 10

const PHONE_RE = /^[\d\s().+-]{7,}$/
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,17}$/

const INITIAL = {
  /* Paso 1 */
  zip: '',
  address: '',
  notListed: false,
  noAddress: '',
  noZip: '',
  noCity: '',
  noState: '',
  /* Paso 2 */
  firstName: '',
  lastName: '',
  homePhone: '',
  cellPhone: '',
  workPhone: '',
  email: '',
  emailConfirm: '',
  contactMethod: '',
  /* Paso 3 */
  requestDetails: '',
  files: [],
}

function ProgressBar({ step }) {
  const steps = ['Location', 'Contact', 'Details']
  return (
    <ol className={styles.progress} aria-label="Form progress">
      {steps.map((label, i) => (
        <li
          key={label}
          className={`${styles.step} ${i + 1 === step ? styles.stepActive : ''} ${i + 1 < step ? styles.stepDone : ''}`}
          aria-current={i + 1 === step ? 'step' : undefined}
        >
          <span className={styles.stepNum}>{i + 1}</span>
          <span className={styles.stepLabel}>{label}</span>
        </li>
      ))}
    </ol>
  )
}

function Step1({ values, errors, onChange, onAddressSelect, suggestions }) {
  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle} tabIndex={-1}>Let us know where you live.</h2>
      <p className={styles.stepDesc}>
        Enter your home's zip code, then select your complete address from the list.
      </p>

      {!values.notListed && (
        <div className={styles.group}>
          <FormField
            label="Zip code"
            name="zip"
            value={values.zip}
            onChange={onChange}
            error={errors.zip}
            required
            placeholder="5-digit ZIP"
          />
          <div className={styles.autocompleteWrapper}>
            <FormField
              label="Home address"
              name="address"
              value={values.address}
              onChange={onChange}
              error={errors.address}
              required={!values.notListed}
              placeholder={suggestions.length > 0 ? 'Type to search…' : 'Enter ZIP first'}
              disabled={suggestions.length === 0}
              autoComplete="off"
            />
            {suggestions.length > 0 && !values.address && (
              <ul className={styles.suggestions} role="listbox" aria-label="Address suggestions">
                {suggestions.map(s => (
                  <li
                    key={s}
                    role="option"
                    aria-selected="false"
                    className={styles.suggestionItem}
                    onClick={() => onAddressSelect(s)}
                    onKeyDown={e => e.key === 'Enter' && onAddressSelect(s)}
                    tabIndex={0}
                  >
                    {s} <span className={styles.testBadge}>[TEST DATA]</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {values.notListed && (
        <div className={styles.group}>
          <FormField
            label="Home address"
            name="noAddress"
            value={values.noAddress}
            onChange={onChange}
            error={errors.noAddress}
            required
          />
          <FormField
            label="Zip code"
            name="noZip"
            value={values.noZip}
            onChange={onChange}
            error={errors.noZip}
            required
            placeholder="5-digit ZIP"
          />
          <FormField
            label="City"
            name="noCity"
            value={values.noCity}
            onChange={onChange}
            error={errors.noCity}
            required
          />
          <FormSelect
            label="State"
            name="noState"
            value={values.noState}
            onChange={onChange}
            error={errors.noState}
            required
            options={US_STATES}
            placeholder="Select state"
          />
        </div>
      )}

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          name="notListed"
          checked={values.notListed}
          onChange={onChange}
          className={styles.checkbox}
        />
        My address isn't listed
      </label>

      <p className={styles.hint}>
        For faster results, begin typing your street address to reduce the number of addresses listed.
        If you don't see your address listed, select "My address isn't listed."
      </p>
    </div>
  )
}

function Step2({ values, errors, onChange }) {
  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle} tabIndex={-1}>How can we contact you?</h2>
      <p className={styles.stepDesc}>Provide your contact information and we'll start processing your request.</p>

      <div className={styles.row}>
        <FormField
          label="First name"
          name="firstName"
          value={values.firstName}
          onChange={onChange}
          error={errors.firstName}
          required
        />
        <FormField
          label="Last name"
          name="lastName"
          value={values.lastName}
          onChange={onChange}
          error={errors.lastName}
          required
        />
      </div>

      <div className={styles.row}>
        <FormField
          label="Home phone"
          name="homePhone"
          type="tel"
          value={values.homePhone}
          onChange={onChange}
          error={errors.homePhone}
          placeholder="(___) ___-____"
        />
        <FormField
          label="Cell phone"
          name="cellPhone"
          type="tel"
          value={values.cellPhone}
          onChange={onChange}
          error={errors.cellPhone}
          placeholder="(___) ___-____"
        />
      </div>

      <FormField
        label="Work phone"
        name="workPhone"
        type="tel"
        value={values.workPhone}
        onChange={onChange}
        error={errors.workPhone}
        placeholder="(___) ___-____"
      />

      <FormField
        label="Email address"
        name="email"
        type="email"
        value={values.email}
        onChange={onChange}
        error={errors.email}
      />
      <FormField
        label="Confirm email address"
        name="emailConfirm"
        type="email"
        value={values.emailConfirm}
        onChange={onChange}
        error={errors.emailConfirm}
      />

      <FormSelect
        label="Select contact preference"
        name="contactMethod"
        value={values.contactMethod}
        onChange={onChange}
        error={errors.contactMethod}
        required
        options={CONTACT_METHODS}
        placeholder="Select contact preference"
      />
    </div>
  )
}

function Step3({ values, errors, onChange, onFilesChange }) {
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  function handleDrop(e) {
    e.preventDefault()
    addFiles(Array.from(e.dataTransfer.files))
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  function handleFileInput(e) {
    addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function addFiles(incoming) {
    const valid = incoming.filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) return false
      if (f.size > MAX_FILE_MB * 1024 * 1024) return false
      return true
    })
    onFilesChange(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !names.has(f.name))]
    })
  }

  function removeFile(name) {
    onFilesChange(prev => prev.filter(f => f.name !== name))
  }

  return (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle} tabIndex={-1}>Describe your request.</h2>

      <div className={styles.fieldFull}>
        <label htmlFor="requestDetails" className={styles.textareaLabel}>
          Request detail
          <span className={styles.req} aria-hidden="true"> *</span>
          <span className={styles.hint2}> (A minimum of 10 characters is required)</span>
        </label>
        <textarea
          id="requestDetails"
          name="requestDetails"
          className={`${styles.textarea} ${errors.requestDetails ? styles.textareaError : ''}`}
          value={values.requestDetails}
          onChange={onChange}
          rows={6}
          maxLength={10000}
          required
          aria-required="true"
          aria-invalid={errors.requestDetails ? 'true' : undefined}
          aria-describedby={errors.requestDetails ? 'requestDetails-err' : undefined}
          placeholder="Please describe the service request in this space. IMPORTANT: If you have multiple requests, please list them all here."
        />
        {errors.requestDetails && (
          <p id="requestDetails-err" className={styles.fieldError} role="alert">
            {errors.requestDetails}
          </p>
        )}
      </div>

      <div
        ref={dropRef}
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="region"
        aria-label="File upload area"
      >
        <p className={styles.dropzoneText}>
          Drag and drop images or PDF files here, or{' '}
          <button
            type="button"
            className={styles.browseBtn}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Browse files to attach"
          >
            browse to attach
          </button>
        </p>
        <p className={styles.dropzoneHint}>
          Accepted: JPG, PNG, GIF, WebP, PDF · Max {MAX_FILE_MB} MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          className={styles.fileInput}
          onChange={handleFileInput}
          aria-label="Select files"
          tabIndex={-1}
        />
      </div>

      {values.files.length > 0 && (
        <ul className={styles.fileList} aria-label="Attached files">
          {values.files.map(f => (
            <li key={f.name} className={styles.fileItem}>
              <span className={styles.fileName}>{f.name}</span>
              <button
                type="button"
                className={styles.removeFile}
                onClick={() => removeFile(f.name)}
                aria-label={`Remove ${f.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {errors.files && (
        <p className={styles.fieldError} role="alert">{errors.files}</p>
      )}

      <p className={styles.disclaimer}>
        By making this submission, you agree that D.R. Horton and its affiliates may process
        the personal information you have provided as stated in our Privacy Policy.
      </p>
    </div>
  )
}

function WarrantyForm() {
  const [step, setStep] = useState(1)
  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const stepTitleRef = useRef(null)

  /* desplazar foco al título al cambiar de paso */
  useEffect(() => {
    stepTitleRef.current?.focus()
  }, [step])

  /* activar sugerencias mock cuando ZIP tiene 5 dígitos */
  useEffect(() => {
    if (!values.notListed && /^\d{5}$/.test(values.zip)) {
      setSuggestions(MOCK_ADDRESSES.map(a => `${a} ${values.zip}`))
    } else {
      setSuggestions([])
      setValues(prev => ({ ...prev, address: '' }))
    }
  }, [values.zip, values.notListed])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  function handleAddressSelect(addr) {
    setValues(prev => ({ ...prev, address: addr }))
    setSuggestions([])
  }

  function setFiles(updater) {
    setValues(prev => ({ ...prev, files: updater(prev.files) }))
  }

  function validateStep1() {
    const errs = {}
    if (!values.notListed) {
      if (!/^\d{5}$/.test(values.zip)) errs.zip = 'Please enter a valid 5-digit ZIP code.'
      if (!values.address.trim()) errs.address = 'Please select your home address from the list.'
    } else {
      if (!values.noAddress.trim()) errs.noAddress = 'Home address is required.'
      if (!/^\d{5}$/.test(values.noZip)) errs.noZip = 'Please enter a valid 5-digit ZIP code.'
      if (!values.noCity.trim()) errs.noCity = 'City is required.'
      if (!values.noState) errs.noState = 'State is required.'
    }
    return errs
  }

  function validateStep2() {
    const errs = {}
    if (!values.firstName.trim()) errs.firstName = 'First name is required.'
    if (!values.lastName.trim()) errs.lastName = 'Last name is required.'
    if (values.homePhone && !PHONE_RE.test(values.homePhone)) errs.homePhone = 'Invalid phone number.'
    if (values.cellPhone && !PHONE_RE.test(values.cellPhone)) errs.cellPhone = 'Invalid phone number.'
    if (values.workPhone && !PHONE_RE.test(values.workPhone)) errs.workPhone = 'Invalid phone number.'
    if (values.email && !EMAIL_RE.test(values.email)) errs.email = 'Please enter a valid email address.'
    if (values.email && values.emailConfirm && values.email !== values.emailConfirm)
      errs.emailConfirm = 'Email addresses do not match.'
    if (!values.contactMethod) errs.contactMethod = 'Please select a contact preference.'
    return errs
  }

  function validateStep3() {
    const errs = {}
    if (!values.requestDetails.trim() || values.requestDetails.trim().length < 10)
      errs.requestDetails = 'Please provide at least 10 characters.'
    return errs
  }

  function handleNext() {
    let errs = {}
    if (step === 1) errs = validateStep1()
    if (step === 2) errs = validateStep2()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep(s => s + 1)
  }

  function handleBack() {
    setErrors({})
    setStep(s => s - 1)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validateStep3()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={styles.thanks} role="status" aria-live="polite">
        <h2 className={styles.thanksHeading}>Thank you for your warranty request!</h2>
        <p>Your request has been received. Your local Customer Care team will review it and follow up with you shortly.</p>
      </div>
    )
  }

  return (
    <form
      className={styles.form}
      onSubmit={step === 3 ? handleSubmit : e => e.preventDefault()}
      noValidate
      aria-label="Warranty request form"
    >
      <h1 className={styles.formHeading}>Submit a warranty request</h1>
      <ProgressBar step={step} />

      {/* ref de foco se asigna al título de cada paso desde Step* components vía el tabIndex */}
      {step === 1 && (
        <Step1
          values={values}
          errors={errors}
          onChange={handleChange}
          onAddressSelect={handleAddressSelect}
          suggestions={suggestions}
        />
      )}
      {step === 2 && (
        <Step2
          values={values}
          errors={errors}
          onChange={handleChange}
        />
      )}
      {step === 3 && (
        <Step3
          values={values}
          errors={errors}
          onChange={handleChange}
          onFilesChange={setFiles}
        />
      )}

      <div className={styles.navButtons}>
        {step > 1 && (
          <button type="button" className={styles.backBtn} onClick={handleBack}>
            Back
          </button>
        )}
        {step < 3 && (
          <button type="button" className={styles.nextBtn} onClick={handleNext}>
            Next
          </button>
        )}
        {step === 3 && (
          <button type="submit" className={styles.nextBtn}>
            Submit
          </button>
        )}
      </div>
    </form>
  )
}

export default WarrantyForm
