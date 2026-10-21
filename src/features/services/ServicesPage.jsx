import CollageGrid from '../../components/ui/CollageGrid'
import CardGrid from '../../components/ui/CardGrid'
import TileCard from '../../components/ui/TileCard'
import { hero, collage, tiles } from './data/services'
import styles from './ServicesPage.module.css'

function ServicesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.lead}>
        <div className={styles.leadInner}>
          <header className={styles.title}>
            <h1>{hero.title}</h1>
            {hero.descriptionLines.map(line => (
              <p key={line}>{line}</p>
            ))}
          </header>
          <div className={styles.collageWrap}>
            <CollageGrid columns={collage} />
          </div>
        </div>
      </section>

      <CardGrid columns={3}>
        {tiles.map(tile => (
          <TileCard key={tile.ctaLabel} {...tile} />
        ))}
      </CardGrid>
    </div>
  )
}

export default ServicesPage
