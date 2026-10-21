import styles from './LotMapBanner.module.css'

function LotMapBanner({ lotMapUrl }) {
  if (!lotMapUrl) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Lot Map</h2>
      <div className={styles.imageWrap}>
        <img
          src={lotMapUrl}
          alt="Community lot map"
          className={styles.image}
          loading="lazy"
        />
      </div>
    </section>
  )
}

export default LotMapBanner
