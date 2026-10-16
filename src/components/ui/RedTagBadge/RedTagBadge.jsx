import styles from './RedTagBadge.module.css'

function RedTagBadge() {
  return (
    <span className={styles.badge} aria-hidden="true">
      <svg
        viewBox="0 0 100 40"
        className={styles.shape}
        focusable="false"
      >
        <path d="M2,2 L88,2 L98,20 L88,38 L2,38 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
      <span className={styles.text}>redtag</span>
    </span>
  )
}

export default RedTagBadge
