import { Link } from 'react-router-dom'
import styles from './CommunityCard.module.css'

const STATUS_LABEL = {
  'now-selling':    'Now Selling',
  'coming-soon':    'Coming Soon',
  'move-in-ready':  'Move-In Ready',
}

function formatPrice(priceFrom) {
  if (!priceFrom) return 'Call for Information'
  const hundreds = Math.floor(priceFrom / 1000)
  return `From the $${hundreds}s`
}

function formatRange({ min, max }) {
  if (min == null) return null
  if (max == null || max === min) return String(min)
  return `${min} - ${max}`
}

function StatItem({ value, label }) {
  if (!value) return null
  return (
    <span className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </span>
  )
}

function CommunityCard({ community }) {
  const {
    slug, name, stateSlug, areaSlug, citySlug, cityName,
    status, priceFrom, beds, baths, garages, sqftFrom,
    availableHomesCount, cardImageUrl,
  } = community

  const href = `/${stateSlug}/${areaSlug}/${citySlug}/${slug}`

  return (
    <article className={styles.card}>
      <Link to={href} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
        {cardImageUrl ? (
          <img src={cardImageUrl} alt="" className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </Link>

      <div className={styles.body}>
        {status && (
          <div className={styles.statusRow}>
            <span className={`${styles.statusDot} ${styles[`status-${status}`]}`} aria-hidden="true" />
            <span className={styles.statusLabel}>{STATUS_LABEL[status] ?? status}</span>
          </div>
        )}

        <h2 className={styles.name}>
          <Link to={href} className={styles.nameLink}>{name}</Link>
        </h2>

        <p className={styles.city}>{cityName}, GA</p>

        <p className={styles.price}>{formatPrice(priceFrom)}</p>

        {(beds || baths || garages) && (
          <div className={styles.statsRow}>
            <StatItem value={formatRange(beds)}    label="bed" />
            <StatItem value={formatRange(baths)}   label="bath" />
            <StatItem value={formatRange(garages)} label="garage" />
            {sqftFrom && (
              <span className={styles.stat}>
                <span className={styles.statValue}>From {sqftFrom.toLocaleString()}</span>
                <span className={styles.statLabel}>&nbsp;sq.&nbsp;ft.</span>
              </span>
            )}
          </div>
        )}

        {availableHomesCount != null && (
          <Link to={`${href}#available`} className={styles.homesLink}>
            {availableHomesCount} homes for sale
          </Link>
        )}
      </div>
    </article>
  )
}

export default CommunityCard
