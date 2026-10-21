import InternalPageHero from '../../components/ui/InternalPageHero'
import SliderCards from '../../components/ui/SliderCards'
import TileCard from '../../components/ui/TileCard'
import CardGrid from '../../components/ui/CardGrid'
import { hero, devices, benefits, hicLogo } from './data/smartHome'
import styles from './SmartHomePage.module.css'

function SmartHomePage() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <InternalPageHero
        title={hero.title}
        subtitle={hero.subtitle}
        size="md"
        align="left"
      />

      <section className={styles.slider} aria-label="Dispositivos del hogar inteligente">
        <SliderCards cards={devices} visibleCount={3} />
      </section>

      <section id="features" className={styles.features} aria-label="Características del hogar inteligente">
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

      <div className={styles.disclaimer}>
        <img src={hicLogo.src} alt={hicLogo.alt} width={hicLogo.width} />
      </div>
    </main>
  )
}

export default SmartHomePage
