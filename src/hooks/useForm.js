import { useState } from 'react'

function validate(fields, rules) {
  const errors = {}
  for (const [name, rule] of Object.entries(rules)) {
    const value = fields[name] ?? ''
    if (rule.required && !value.toString().trim()) {
      errors[name] = rule.requiredMsg ?? 'Este campo es requerido.'
      continue
    }
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[name] = rule.patternMsg ?? 'Formato inválido.'
    }
  }
  return errors
}

function useForm(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  function handleSubmit(onSuccess) {
    return function (e) {
      e.preventDefault()
      const newErrors = validate(values, validationRules)
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      setSubmitted(true)
      onSuccess?.(values)
    }
  }

  function reset() {
    setValues(initialValues)
    setErrors({})
    setSubmitted(false)
  }

  return { values, errors, submitted, handleChange, handleSubmit, reset }
}

export default useForm
