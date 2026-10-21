import styles from './FloorPlanCard.module.css'

function StatBadge({ value, label }) {
  if (value == null) return null
  return (
    <span className={styles.badge}>
      <span className={styles.badgeValue}>{value}</span>
      <span className={styles.badgeLabel}>{label}</span>
    </span>
  )
}

function FloorPlanCard({ plan }) {
  const { name, priceFrom, beds, baths, garages, stories, sqft, imageUrl } = plan

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt={`${name} floor plan`} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            <span className={styles.placeholderLabel}>{name}</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {priceFrom != null ? (
          <p className={styles.price}>From ${priceFrom.toLocaleString()}</p>
        ) : (
          <p className={styles.price}>Call for Information</p>
        )}

        <div className={styles.badges}>
          <StatBadge value={beds}    label="bed" />
          <StatBadge value={baths}   label="bath" />
          <StatBadge value={garages} label="garage" />
          <StatBadge value={stories} label={stories === 1 ? 'story' : 'stories'} />
          {sqft != null && (
            <StatBadge value={sqft.toLocaleString()} label="sq. ft." />
          )}
        </div>
      </div>
    </article>
  )
}

export default FloorPlanCard
