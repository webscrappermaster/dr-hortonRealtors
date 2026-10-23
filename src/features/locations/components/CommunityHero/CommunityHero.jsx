import { formatUSD, formatNumber } from '../../../../utils/formatters'
import styles from './CommunityHero.module.css'

const STATUS_LABEL = {
  'now-selling':         'Now Selling',
  'coming-soon':         'Coming Soon',
  'move-in-ready':       'Move-In Ready',
  'final-opportunities': 'Final Opportunities',
  'sold-out':            'Sold Out',
}

function slugToTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatRange(obj) {
  if (!obj) return null
  const { min, max } = obj
  if (min == null) return null
  if (max == null || max === min) return String(min)
  return `${min} – ${max}`
}

function CommunityHero({ community }) {
  const {
    name, status, series, priceFrom, address,
    beds, baths, garages, stories, sqftFrom,
  } = community

  return (
    <header className={styles.hero}>
      {status && (
        <div className={styles.statusRow}>
          <span className={`${styles.statusDot} ${styles[`status-${status}`]}`} aria-hidden="true" />
          <span className={styles.statusLabel}>{STATUS_LABEL[status] ?? slugToTitle(status)}</span>
        </div>
      )}

      <h1 className={styles.name}>{name}</h1>

      <div className={styles.priceRow}>
        {priceFrom && (
          <p className={styles.price}>
            From {formatUSD(priceFrom)}
          </p>
        )}
        {series && (
          <p className={styles.series}>{series}</p>
        )}
      </div>

      {address && (
        <p className={styles.address}>{address}</p>
      )}

      <dl className={styles.stats}>
        {beds && (
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Bed</dt>
            <dd className={styles.statValue}>{formatRange(beds)}</dd>
          </div>
        )}
        {baths && (
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Bath</dt>
            <dd className={styles.statValue}>{formatRange(baths)}</dd>
          </div>
        )}
        {garages && (
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Garage</dt>
            <dd className={styles.statValue}>{formatRange(garages)}</dd>
          </div>
        )}
        {stories && (
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Story</dt>
            <dd className={styles.statValue}>{formatRange(stories)}</dd>
          </div>
        )}
        {sqftFrom && (
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Sq. Ft.</dt>
            <dd className={styles.statValue}>From {formatNumber(sqftFrom)}</dd>
          </div>
        )}
      </dl>
    </header>
  )
}

export default CommunityHero
