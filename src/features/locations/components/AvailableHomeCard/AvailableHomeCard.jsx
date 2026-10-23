import styles from './AvailableHomeCard.module.css'

const STATUS_LABEL = {
  'under-contract': 'Under Contract',
  'move-in-ready':  'Move-In Ready',
}

function StatBadge({ value, label }) {
  if (value == null) return null
  return (
    <span className={styles.badge}>
      <span className={styles.badgeValue}>{value}</span>
      <span className={styles.badgeLabel}>{label}</span>
    </span>
  )
}

function AvailableHomeCard({ home }) {
  const {
    address, cityStateZip, planName,
    price, wasPrice,
    beds, baths, garages, stories, sqft,
    lot, status, isRte, imageUrl,
  } = home

  const isUnderContract = status === 'under-contract'
  const cardClass = isUnderContract
    ? `${styles.card} ${styles['card-under-contract']}`
    : styles.card

  // Cuando no hay dirección scrapeada, mostramos "Lot X" como encabezado
  const displayAddress = address ?? (lot ? `Lot ${lot}` : null)

  return (
    <article
      className={cardClass}
      aria-label={isUnderContract && displayAddress ? `${displayAddress} — Under Contract` : undefined}
    >
      {isRte && (
        <div className={styles.rteBadge} aria-label="Red Tag Event home">
          Red Tag Event
        </div>
      )}

      {/* aria-hidden: el párrafo de status en el body ya lo anuncia a lectores de pantalla */}
      {isUnderContract && (
        <div className={styles.ucBadge} aria-hidden="true">
          Under Contract
        </div>
      )}

      <div className={styles.imageWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt={displayAddress ?? ''} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.body}>
        <header className={styles.header}>
          <h3 className={styles.address}>{displayAddress}</h3>
          {cityStateZip && <p className={styles.location}>{cityStateZip}</p>}
        </header>

        {planName && <p className={styles.planName}>{planName}</p>}

        {status && (
          <p className={`${styles.status} ${styles[`status-${status}`]}`}>
            {STATUS_LABEL[status] ?? status}
          </p>
        )}

        <div className={styles.priceRow}>
          {price != null ? (
            <span className={styles.price}>${price.toLocaleString()}</span>
          ) : (
            <span className={styles.priceNA}>Call for Information</span>
          )}
          {wasPrice != null && (
            <s className={styles.wasPrice}>${wasPrice.toLocaleString()}</s>
          )}
        </div>

        <div className={styles.badges}>
          <StatBadge value={beds}    label="bed" />
          <StatBadge value={baths}   label="bath" />
          <StatBadge value={garages} label="garage" />
          <StatBadge value={stories} label={stories === 1 ? 'story' : 'stories'} />
          {sqft != null && (
            <StatBadge value={sqft.toLocaleString()} label="sq. ft." />
          )}
        </div>

        {/* Muestra lote solo cuando hay dirección para no duplicar con el encabezado */}
        {lot && address && <p className={styles.lot}>Lot {lot}</p>}
      </div>
    </article>
  )
}

export default AvailableHomeCard
