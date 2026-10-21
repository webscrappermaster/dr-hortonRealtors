import InternalPageHero from '../../components/ui/InternalPageHero'
import SliderCards from '../../components/ui/SliderCards'
import CardGrid from '../../components/ui/CardGrid'
import TileCard from '../../components/ui/TileCard'
import { hero, devices, benefits } from './data/smartHome'
import styles from './SmartHomePage.module.css'

function SmartHomePage() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <InternalPageHero
        title={<span dangerouslySetInnerHTML={{ __html: hero.title }} />}
        subtitle={hero.subtitle}
        align="center"
        size="sm"
      />

      <section className={styles.slider} aria-labelledby="devices-heading">
        <h2 id="devices-heading" className={styles.srOnly}>
          Dispositivos del hogar inteligente
        </h2>
        <SliderCards cards={devices} visibleCount={3} />
      </section>

      <section className={styles.benefits} aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className={styles.srOnly}>
          Beneficios de vivir en un hogar inteligente
        </h2>
        <CardGrid columns={3}>
          {benefits.map(tile => (
            <TileCard
              key={tile.title}
              image={tile.image}
              imageAlt={tile.imageAlt}
              title={tile.title}
              description={tile.description}
            />
          ))}
        </CardGrid>
      </section>
    </main>
  )
}

export default SmartHomePage
