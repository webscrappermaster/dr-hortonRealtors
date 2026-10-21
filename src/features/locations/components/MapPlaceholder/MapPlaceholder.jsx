import styles from './MapPlaceholder.module.css'

function MapPlaceholder({ label = 'Map view' }) {
  return (
    <div className={styles.placeholder} aria-label={label} role="img">
      <svg className={styles.icon} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect width="64" height="64" rx="4" fill="#E8EDF2"/>
        <path d="M32 14C24.3 14 18 20.3 18 28c0 12 14 24 14 24s14-12 14-24c0-7.7-6.3-14-14-14z" fill="#B0BEC5"/>
        <circle cx="32" cy="28" r="5" fill="#78909C"/>
      </svg>
      <p className={styles.text}>Map coordinates not available</p>
    </div>
  )
}

export default MapPlaceholder
