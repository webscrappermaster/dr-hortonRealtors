import { Link } from 'react-router-dom'
import { promoBarData } from '../data/promoBar'
import RedTagBadge from '../../ui/RedTagBadge'
import styles from './PromoBar.module.css'

const ArrowIcon = () => (
  <svg
    width="8"
    height="12"
    viewBox="0 0 8 12"
    aria-hidden="true"
    focusable="false"
    className={styles.arrow}
  >
    <path d="M0 0 L8 6 L0 12 Z" fill="currentColor" />
  </svg>
)

function PromoBar() {
  const { text, to } = promoBarData

  return (
    <div className={styles.bar} role="complementary" aria-label="Oferta promocional">
      <Link to={to} className={styles.link} aria-label={`${text} — ver oferta redtag`}>
        <RedTagBadge />
        <span>{text}</span>
        <ArrowIcon />
      </Link>
    </div>
  )
}

export default PromoBar
