import { Link } from 'react-router-dom'
import styles from './TileCard.module.css'

/* Soporta 3 modos:
   - sin href      → tarjeta pasiva (ej: tiles de military-benefits "Ready / Peace / Investment")
   - href interno  → <Link to={href}>
   - href externo  → <a href target="_blank" rel="noopener noreferrer">
   El prop `image` es opcional; si viene se renderiza arriba del contenido. */

function TileCard({
  image,
  imageAlt = '',
  eyebrow,
  title,
  description,
  ctaLabel,
  href,
  external = false,
  variant = 'default',
  ctaStyle = 'pill',
}) {
  const classes = [styles.tile, styles[`variant-${variant}`]].filter(Boolean).join(' ')
  const ctaClasses = [styles.cta, styles[`cta-${ctaStyle}`]].filter(Boolean).join(' ')
  const content = (
    <>
      {image && (
        <div className={styles.image}>
          <img src={image} alt={imageAlt} loading="lazy" />
        </div>
      )}
      <div className={styles.content}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        {title && <h2 className={styles.title}>{title}</h2>}
        {description && <p className={styles.description}>{description}</p>}
        {ctaLabel && <span className={ctaClasses}>{ctaLabel}</span>}
      </div>
    </>
  )

  if (!href) {
    return <article className={classes}>{content}</article>
  }

  if (external) {
    return (
      <a
        className={`${classes} ${styles.linked}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <Link className={`${classes} ${styles.linked}`} to={href}>
      {content}
    </Link>
  )
}

export default TileCard
