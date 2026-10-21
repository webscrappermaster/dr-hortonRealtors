import HalfVideoHero from '../../components/ui/HalfVideoHero'
import CollageGrid from '../../components/ui/CollageGrid'
import ThreeColumnCards from '../../components/ui/ThreeColumnCards'
import heartSvg from '../../assets/images/real-estate-agents/DRH-heart-REA.svg'
import { VIMEO_ID, VIDEO_POSTER, VIDEO_POSTER_ALT, heroText, partnerSection, threeCards } from './data/realEstateAgents'
import styles from './RealEstateAgentsPage.module.css'

function RealEstateAgentsPage() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <HalfVideoHero vimeoId={VIMEO_ID} posterSrc={VIDEO_POSTER} posterAlt={VIDEO_POSTER_ALT}>
        <h1 className={styles.heroTitle}>
          We{' '}
          <img
            src={heartSvg}
            alt="love"
            className={styles.heartIcon}
            aria-label="love"
          />{' '}
          real estate agents
        </h1>
        {heroText.paragraphs.map(p => (
          <p key={p} className={styles.heroParagraph}>
            {p}
          </p>
        ))}
      </HalfVideoHero>

      <section className={styles.partner} aria-labelledby="partner-heading">
        <div className={styles.partnerInner}>
          <div className={styles.partnerCollage}>
            <CollageGrid columns={partnerSection.collage} />
          </div>
          <div className={styles.partnerText}>
            <h2 id="partner-heading">{partnerSection.heading}</h2>
            <h3>{partnerSection.subheading}</h3>
            <p className={styles.disclaimer}>{partnerSection.disclaimer}</p>
          </div>
        </div>
      </section>

      <section className={styles.cards} aria-labelledby="cards-heading">
        <h2 id="cards-heading" className={styles.srOnly}>
          Por qué trabajar con D.R. Horton
        </h2>
        <ThreeColumnCards cards={threeCards} />
      </section>
    </main>
  )
}

export default RealEstateAgentsPage
