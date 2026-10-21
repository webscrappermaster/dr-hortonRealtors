import CardGrid from '../../components/ui/CardGrid'
import TileCard from '../../components/ui/TileCard'
import { hero, tiles } from './data/customerCare'
import styles from './CustomerCarePage.module.css'

function CustomerCarePage() {
  return (
    <div className={styles.page}>
      <header className={styles.title}>
        <h1>{hero.title}</h1>
      </header>

      <div className={styles.careGrid}>
        <CardGrid columns={4} align="stretch">
          {tiles.map(tile => (
            <TileCard key={tile.title} {...tile} ctaStyle="link" />
          ))}
        </CardGrid>
      </div>
    </div>
  )
}

export default CustomerCarePage
