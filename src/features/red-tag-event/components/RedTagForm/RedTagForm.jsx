import FormField from '../../../../components/ui/Form/FormField'
import FormSelect from '../../../../components/ui/Form/FormSelect'
import FormLayout from '../../../../components/ui/Form/FormLayout'
import useForm from '../../../../hooks/useForm'
import { statesIndex } from '../../../locations/data/statesIndex'
import { getArea } from '../../../locations/data/locationLoader'
import { iAmAOptions, movingInOptions, disclaimer } from '../../data/redTagEvent'
import styles from './RedTagForm.module.css'

const stateOptions = statesIndex.map(s => ({ value: s.name, label: s.name }))

function getMarkets(stateName) {
  const entry = statesIndex.find(s => s.name.toLowerCase() === stateName.toLowerCase())
  return entry ? entry.markets.map(m => ({ value: m.name, label: m.name })) : []
}

/* Devuelve las ciudades únicas del área si hay datos JSON; null si no. */
function getCitiesFromArea(stateName, areaName) {
  const stateEntry = statesIndex.find(s => s.name.toLowerCase() === stateName.toLowerCase())
  if (!stateEntry) return null
  const areaEntry = stateEntry.markets.find(m => m.name.toLowerCase() === areaName.toLowerCase())
  if (!areaEntry) return null
  const areaData = getArea(stateEntry.slug, areaEntry.slug)
  if (!areaData?.communities?.length) return null
  const cities = [...new Set(areaData.communities.map(c => c.cityName).filter(Boolean))]
  return cities.map(city => ({ value: city, label: city }))
}

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

  const areaOptions   = values.state ? getMarkets(values.state) : []
  const cityOptions   = values.state && values.areaOfInterest
    ? getCitiesFromArea(values.state, values.areaOfInterest)
    : null
  const hasCityData   = cityOptions !== null

  function handleStateChange(e) {
    handleChange(e)
    /* React 19 batch: ambas actualizaciones se fusionan en un render */
    handleChange({ target: { name: 'areaOfInterest', value: '' } })
    handleChange({ target: { name: 'city', value: '' } })
  }

  function handleAreaChange(e) {
    handleChange(e)
    handleChange({ target: { name: 'city', value: '' } })
  }

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
          onChange={handleStateChange}
          error={errors.state}
          required
          options={stateOptions}
        />

        <FormSelect
          label="Area of interest"
          name="areaOfInterest"
          value={values.areaOfInterest}
          onChange={handleAreaChange}
          error={errors.areaOfInterest}
          options={areaOptions}
          placeholder={values.state ? 'Make a selection' : 'Select a state first'}
          disabled={!values.state}
        />

        <FormSelect
          label="City"
          name="city"
          value={values.city}
          onChange={handleChange}
          error={errors.city}
          options={hasCityData ? cityOptions : []}
          placeholder={
            hasCityData
              ? 'Make a selection'
              : values.areaOfInterest
                ? 'Available in a future update'
                : 'Select an area first'
          }
          disabled={!hasCityData}
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
