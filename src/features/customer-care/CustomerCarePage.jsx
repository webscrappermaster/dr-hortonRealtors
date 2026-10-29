import CardGrid from '../../components/ui/CardGrid'
import TileCard from '../../components/ui/TileCard'
import { hero, tiles } from './data/customerCare'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { buildWhatsAppUrl, buildMaintenanceMessage, buildLandContactMessage } from '../../utils/whatsapp'
import styles from './CustomerCarePage.module.css'

function resolveHref(tile, whatsappNumber) {
  if (!tile.whatsappMsg) return { href: tile.href, external: false }
  const msg = tile.whatsappMsg === 'maintenance'
    ? buildMaintenanceMessage()
    : buildLandContactMessage()
  const url = buildWhatsAppUrl(whatsappNumber, msg)
  return url
    ? { href: url, external: true }
    : { href: '/contact-us-page', external: false }
}

function CustomerCarePage() {
  const { whatsappNumber } = useSiteSettings()

  return (
    <div className={styles.page}>
      <header className={styles.title}>
        <h1>{hero.title}</h1>
      </header>

      <div className={styles.careGrid}>
        <CardGrid columns={4} align="stretch">
          {tiles.map(tile => {
            const { href, external } = resolveHref(tile, whatsappNumber)
            return (
              <TileCard
                key={tile.title}
                title={tile.title}
                ctaLabel={tile.ctaLabel}
                href={href}
                external={external}
                ctaStyle="link"
              />
            )
          })}
        </CardGrid>
      </div>
    </div>
  )
}

export default CustomerCarePage
