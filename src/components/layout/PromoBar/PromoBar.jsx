import { Link } from 'react-router-dom'
import { promoBarData } from '../data/promoBar'
import RedTagBadge from '../../ui/RedTagBadge'
import styles from './PromoBar.module.css'

/* Flecha real del original: viewBox 0 0 15 15. */
const PromoArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    aria-hidden="true"
    focusable="false"
    className={styles.arrow}
  >
    <path
      d="m15 7.48-4.63 7.12H5.53l3.04-5.2H0V5.56h8.57L5.53.39h4.84L15 7.48z"
      fill="currentColor"
    />
  </svg>
)

function PromoBar() {
  const { message, cta, to, ariaLabel } = promoBarData

  return (
    <div className={styles.bar} role="complementary" aria-label="Oferta promocional">
      <Link to={to} className={styles.link} aria-label={ariaLabel}>
        <RedTagBadge className={styles.badge} />
        <span className={styles.message}>{message}</span>
        <span className={styles.cta}>
          {cta}
          <PromoArrow />
        </span>
      </Link>
    </div>
  )
}

export default PromoBar
