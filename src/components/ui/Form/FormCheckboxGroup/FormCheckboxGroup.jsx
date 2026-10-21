import styles from './FormCheckboxGroup.module.css'

function FormCheckboxGroup({ legend, name, options = [], values = [], onChange, error }) {
  const errorId = `${name}-error`

  function handleChange(e) {
    const { value, checked } = e.target
    const next = checked ? [...values, value] : values.filter(v => v !== value)
    onChange({ target: { name, value: next } })
  }

  return (
    <fieldset
      className={styles.fieldset}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map(opt => (
          <label key={opt.value} className={styles.option}>
            <input
              type="checkbox"
              name={name}
              value={opt.value}
              checked={values.includes(opt.value)}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span className={styles.optionLabel}>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default FormCheckboxGroup
