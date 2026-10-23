import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCommunityImage } from '../../data/locationLoader'
import { stateSlugToAbbr } from '../../../../utils/usStates'
import styles from './CommunityCard.module.css'

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

function CommunityCard({ community, highlighted, onHover, onHoverEnd }) {
  const [imgFailed, setImgFailed] = useState(false)

  const {
    slug, name, stateSlug, areaSlug, citySlug, cityName,
    status, priceFrom, beds, baths, garages, sqftFrom,
    availableHomesCount,
  } = community

  const imageSrc = getCommunityImage(community)
  const href = `/${stateSlug}/${areaSlug}/${citySlug}/${slug}`

  return (
    <article
      className={`${styles.card}${highlighted ? ` ${styles.highlighted}` : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      <Link to={href} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
        {imageSrc && !imgFailed ? (
          <img
            src={imageSrc}
            alt=""
            className={styles.image}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </Link>

      <div className={styles.body}>
        {status && (
          <div className={styles.statusRow}>
            <span className={`${styles.statusDot} ${styles[`status-${status}`]}`} aria-hidden="true" />
            <span className={styles.statusLabel}>{STATUS_LABEL[status] ?? slugToTitle(status)}</span>
          </div>
        )}

        <h2 className={styles.name}>
          <Link to={href} className={styles.nameLink}>{name}</Link>
        </h2>

        <p className={styles.city}>{cityName}, {stateSlugToAbbr(stateSlug)}</p>

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
