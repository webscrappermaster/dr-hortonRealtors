import { Link } from 'react-router-dom'
import styles from './ImageTextBlock.module.css'

/* ImageTextBlock — bloque imagen + texto en flex row.
   `imageSide` controla si la imagen va a la izquierda o derecha en desktop.
   `cta` es opcional: { label, href, external, icon }.
   `icon` es opcional (una imagen SVG decorativa arriba del título).
   `disclaimer` muestra texto chico abajo (ej: nota de ingresos de real-estate-agents). */

function ImageTextBlock({
  image,
  imageAlt = '',
  icon,
  iconAlt = '',
  iconVariant,
  eyebrow,
  title,
  description,
  cta,
  disclaimer,
  imageSide = 'left',
  variant = 'default',
  ctaVariant = 'default',
}) {
  const classes = [
    styles.block,
    styles[`side-${imageSide}`],
    styles[`variant-${variant}`],
  ]
    .filter(Boolean)
    .join(' ')

  const ctaClass = [styles.cta, ctaVariant === 'plain' && styles.ctaPlain].filter(Boolean).join(' ')

  const renderCta = () => {
    if (!cta) return null
    if (cta.external) {
      return (
        <a className={ctaClass} href={cta.href} target="_blank" rel="noopener noreferrer">
          {cta.label}
        </a>
      )
    }
    return (
      <Link className={ctaClass} to={cta.href}>
        {cta.label}
      </Link>
    )
  }

  return (
    <section className={classes}>
      <div className={styles.image}>
        <img src={image} alt={imageAlt} loading="lazy" />
      </div>
      <div className={styles.text}>
        <div className={styles.textContent}>
          {icon && <img src={icon} alt={iconAlt} className={`${styles.icon}${iconVariant ? ` ${styles[`icon-${iconVariant}`]}` : ''}`} />}
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          {title && <h2 className={styles.title}>{title}</h2>}
          {description && <p className={styles.description}>{description}</p>}
          {renderCta()}
          {disclaimer && <p className={styles.disclaimer}>{disclaimer}</p>}
        </div>
      </div>
    </section>
  )
}

export default ImageTextBlock
