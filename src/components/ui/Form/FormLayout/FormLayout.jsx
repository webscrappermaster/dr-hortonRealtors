import styles from './FormLayout.module.css'

function FormLayout({ children, columns = 2, actions, onSubmit, className = '' }) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`${styles.form} ${className}`}
    >
      <div className={`${styles.grid} ${styles[`cols-${columns}`]}`}>
        {children}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </form>
  )
}

export default FormLayout
