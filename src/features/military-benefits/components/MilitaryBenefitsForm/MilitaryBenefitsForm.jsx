import { useState } from 'react'
import FormField from '../../../../components/ui/Form/FormField'
import FormSelect from '../../../../components/ui/Form/FormSelect'
import FormLayout from '../../../../components/ui/Form/FormLayout'
import useForm from '../../../../hooks/useForm'
import {
  militaryBranchOptions,
  currentStatusOptions,
  installationsByBranch,
} from '../../data/militaryBenefits'
import styles from './MilitaryBenefitsForm.module.css'

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  branch: '',
  currentStatus: '',
  installation: '',
}

const RULES = {
  firstName:     { required: true,  requiredMsg: 'First name is required.' },
  lastName:      { required: true,  requiredMsg: 'Last name is required.' },
  email: {
    required: true,
    requiredMsg: 'Email is required.',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMsg: 'Please enter a valid email address.',
  },
  phone: {
    required: false,
    pattern: /^[\d\s\-().+]{7,}$/,
    patternMsg: 'Please enter a valid phone number.',
  },
  branch:        { required: true,  requiredMsg: 'Military branch is required.' },
  currentStatus: { required: true,  requiredMsg: 'Current status is required.' },
}

const disclaimer =
  'By making this submission, you agree that D.R. Horton and its affiliates may process the personal information you have provided to respond to your inquiry and provide you with related information. You may revoke this consent at any time as described in our Privacy Policy.'

function MilitaryBenefitsForm() {
  const { values, errors, submitted, handleChange, handleSubmit } = useForm(INITIAL, RULES)
  const [installError, setInstallError] = useState('')

  const installOptions = values.branch ? (installationsByBranch[values.branch] ?? []) : []
  const innerSubmit = handleSubmit()

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
      <div className={styles.thankYou} role="status" aria-live="polite">
        <h2>Thank you for reaching out!</h2>
        <p>
          We received your information and a D.R. Horton representative will be
          in touch with you soon.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.formTitle}>Connect with us.</h2>

      <FormLayout
        onSubmit={onSubmit}
        columns={2}
        actions={
          <>
            <button type="submit" className={styles.submitBtn}>
              Send message
            </button>
            <p className={styles.disclaimer}>{disclaimer}</p>
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
          label="Phone"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          error={errors.phone}
          autoComplete="tel"
        />

        <FormSelect
          label="Military branch"
          name="branch"
          value={values.branch}
          onChange={handleBranchChange}
          error={errors.branch}
          required
          options={militaryBranchOptions}
        />

        <FormSelect
          label="Current status"
          name="currentStatus"
          value={values.currentStatus}
          onChange={handleChange}
          error={errors.currentStatus}
          required
          options={currentStatusOptions}
        />

        {values.branch && (
          <FormSelect
            label="Installation"
            name="installation"
            value={values.installation}
            onChange={handleChange}
            error={installError}
            required
            options={installOptions}
          />
        )}
      </FormLayout>
    </div>
  )
}

export default MilitaryBenefitsForm
