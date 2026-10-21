import { Link } from 'react-router-dom'
import CollageGrid from '../../components/ui/CollageGrid'
import CardGrid from '../../components/ui/CardGrid'
import TileCard from '../../components/ui/TileCard'
import {
  topCollage,
  heroTitle,
  buildingEveryDay,
  myStorySectionTitle,
  myStoryCards,
  moreThanBuilder,
  bottomCollage,
  comeWorkWithUs,
  hfesLogoAsset,
} from './data/whoWeAre'
import styles from './WhoWeArePage.module.css'

function WhoWeArePage() {
  return (
    <div className={styles.page}>
      <div className={styles.topCollage}>
        <CollageGrid columns={topCollage} />
      </div>

      <header className={styles.heroTitle}>
        <h1>{heroTitle}</h1>
      </header>

      <section className={styles.highlight} aria-labelledby="we-are-building">
        <div className={styles.highlightInner}>
          <h3 id="we-are-building">{buildingEveryDay.title}</h3>
          {buildingEveryDay.paragraphs.map(line => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section className={styles.stories} aria-labelledby="my-story">
        <div className={styles.storiesInner}>
          <h3 id="my-story" className={styles.storiesTitle}>
            {myStorySectionTitle}
          </h3>
          <ul className={styles.storiesGrid}>
            {myStoryCards.map(card => (
              <li key={card.name} className={styles.storyCard}>
                <div className={styles.storyImage}>
                  <img src={card.image} alt={card.imageAlt} loading="lazy" />
                </div>
                <div className={styles.storyContent}>
                  <p className={styles.storyQuote}>{card.quote}</p>
                  <p className={styles.storyAuthor}>
                    {card.name}
                    <span aria-hidden="true">|</span>
                    {card.state}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.cards} aria-labelledby="more-than-builder">
        <h3 id="more-than-builder">{moreThanBuilder.title}</h3>
        <CardGrid columns={3}>
          {moreThanBuilder.tiles.map(tile => (
            <TileCard key={tile.title} {...tile} ctaStyle="link" />
          ))}
        </CardGrid>
      </section>

      <div className={styles.topCollage}>
        <CollageGrid columns={bottomCollage} />
      </div>

      <section className={styles.callOut} aria-labelledby="come-work">
        <h3 id="come-work">{comeWorkWithUs.title}</h3>
        <p>{comeWorkWithUs.description}</p>
        <Link to={comeWorkWithUs.cta.href} className={styles.btn}>
          {comeWorkWithUs.cta.label}
        </Link>
      </section>

      <div className={styles.hfes}>
        <img src={hfesLogoAsset.src} alt={hfesLogoAsset.alt} />
      </div>
    </div>
  )
}

export default WhoWeArePage
