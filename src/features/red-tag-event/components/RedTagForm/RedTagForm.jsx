import FormField from '../../../../components/ui/Form/FormField'
import FormSelect from '../../../../components/ui/Form/FormSelect'
import FormLayout from '../../../../components/ui/Form/FormLayout'
import useForm from '../../../../hooks/useForm'
import { stateOptions, iAmAOptions, movingInOptions, disclaimer } from '../../data/redTagEvent'
import styles from './RedTagForm.module.css'

const INITIAL = {
  state: '',
  areaOfInterest: '',
  city: '',
  iAmA: 'Prospective Buyer',
  movingIn: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

const RULES = {
  state:     { required: true, requiredMsg: 'State is required.' },
  iAmA:      { required: true, requiredMsg: 'I am a is required.' },
  movingIn:  { required: true, requiredMsg: 'Moving in is required.' },
  firstName: { required: true, requiredMsg: 'First name is required.' },
  lastName:  { required: true, requiredMsg: 'Last name is required.' },
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
}

function RedTagForm() {
  const { values, errors, submitted, handleChange, handleSubmit } = useForm(INITIAL, RULES)

  if (submitted) {
    return (
      <div className={styles.thankYou} role="status" aria-live="polite">
        <h2>Thank you for your interest in our Red Tag Event!</h2>
        <p>
          We received your information and will be in touch shortly. In the meantime,
          check out our current inventory:
        </p>
        <a href="/georgia" className={styles.inventoryBtn}>
          Current inventory
        </a>
      </div>
    )
  }

  return (
    <div className={styles.wrapper} id="rte-form">
      <h2 className={styles.formTitle}>Find deals on homes near you.</h2>

      <FormLayout
        onSubmit={handleSubmit()}
        columns={2}
        actions={
          <>
            <button type="submit" className={styles.submitBtn}>
              See the list
            </button>
            <p className={styles.disclaimer}>{disclaimer}</p>
          </>
        }
      >
        <FormSelect
          label="State"
          name="state"
          value={values.state}
          onChange={handleChange}
          error={errors.state}
          required
          options={stateOptions}
        />

        <FormSelect
          label="Area of interest"
          name="areaOfInterest"
          value={values.areaOfInterest}
          onChange={handleChange}
          error={errors.areaOfInterest}
          options={[]}
          placeholder="Select a state first"
          disabled={!values.state}
        />

        <FormSelect
          label="City"
          name="city"
          value={values.city}
          onChange={handleChange}
          error={errors.city}
          options={[]}
          placeholder="Select a state first"
          disabled={!values.state}
        />

        <FormSelect
          label="I am a"
          name="iAmA"
          value={values.iAmA}
          onChange={handleChange}
          error={errors.iAmA}
          required
          options={iAmAOptions}
        />

        <FormSelect
          label="Moving in"
          name="movingIn"
          value={values.movingIn}
          onChange={handleChange}
          error={errors.movingIn}
          required
          options={movingInOptions}
        />

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
      </FormLayout>
    </div>
  )
}

export default RedTagForm
