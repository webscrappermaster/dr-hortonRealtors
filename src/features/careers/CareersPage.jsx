import CollageGrid from '../../components/ui/CollageGrid'
import TileCard from '../../components/ui/TileCard'
import ImageTextBlock from '../../components/ui/ImageTextBlock'
import { hero, collage, joinTheTeam, tiles, programs } from './data/careers'
import styles from './CareersPage.module.css'

function CareersPage() {
  return (
    <div className={styles.page}>
      <section className={styles.lead}>
        <div className={styles.leadInner}>
          <header className={styles.title}>
            <h1>
              {hero.title}
              {hero.trademark && <sup>{hero.trademark}</sup>}
            </h1>
            {hero.paragraphs.map(line => (
              <p key={line}>{line}</p>
            ))}
          </header>
          <div className={styles.collageWrap}>
            <CollageGrid columns={collage} />
          </div>
        </div>
      </section>

      <section className={styles.join} aria-labelledby="join-team">
        <div className={styles.joinInner}>
          <div className={styles.joinText}>
            <h3 id="join-team">{joinTheTeam.title}</h3>
            <p>{joinTheTeam.description}</p>
            <ul className={styles.benefits}>
              {joinTheTeam.benefits.map(benefit => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
          <div className={styles.joinTiles}>
            {tiles.map(tile => (
              <TileCard key={tile.title} {...tile} ctaStyle="link" />
            ))}
          </div>
        </div>
      </section>

      <div className={styles.programs}>
        {programs.map(program => (
          <ImageTextBlock key={program.title} {...program} />
        ))}
      </div>
    </div>
  )
}

export default CareersPage
