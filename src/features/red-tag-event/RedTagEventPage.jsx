import RedTagHero from './components/RedTagHero'
import RedTagForm from './components/RedTagForm'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { formatPromoRange, isPromoActive } from '../../utils/promoDates'
import styles from './RedTagEventPage.module.css'

function RedTagEventPage() {
  const { promoDeadline, promoStartDate } = useSiteSettings()
  const active = isPromoActive(promoDeadline)
  const dateRange = active ? formatPromoRange(promoStartDate, promoDeadline) : ''

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <RedTagHero dateRange={dateRange} />
      <RedTagForm />
    </main>
  )
}

export default RedTagEventPage
