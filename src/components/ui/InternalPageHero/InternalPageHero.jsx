import styles from './InternalPageHero.module.css'

function InternalPageHero({
  eyebrow,
  title,
  subtitle,
  description,
  align = 'left',
  size = 'md',
  children,
}) {
  const classes = [styles.hero, styles[`align-${align}`], styles[`size-${size}`]]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={classes}>
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        {title && <h1 className={styles.title}>{title}</h1>}
        {subtitle && <h2 className={styles.subtitle}>{subtitle}</h2>}
        {description && <p className={styles.description}>{description}</p>}
        {children}
      </div>
    </section>
  )
}

export default InternalPageHero
