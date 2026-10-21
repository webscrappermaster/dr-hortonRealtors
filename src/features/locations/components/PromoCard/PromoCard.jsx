import { Link } from 'react-router-dom'
import styles from './PromoCard.module.css'

function PromoCard({ promo }) {
  if (!promo) return null
  const { imageUrl, title, description, disclaimer } = promo

  return (
    <section className={styles.card} aria-label="Current promotion">
      {imageUrl && (
        <div className={styles.imageWrap}>
          <img src={imageUrl} alt={title ?? 'Promotion'} className={styles.image} loading="lazy" />
        </div>
      )}
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {description && <p className={styles.description}>{description}</p>}
        <Link to="/red-tag-event" className={styles.cta}>See deals</Link>
        {disclaimer && <p className={styles.disclaimer}>{disclaimer}</p>}
      </div>
    </section>
  )
}

export default PromoCard
