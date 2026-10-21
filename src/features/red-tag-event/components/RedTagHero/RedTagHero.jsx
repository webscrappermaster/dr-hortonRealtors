import logoRte from '../../../../assets/brand/L1_Red-Tag-Event_Logo_Red.svg'
import heroImg from '../../../../assets/images/red-tag-event/desktop-landingv2.webp'
import styles from './RedTagHero.module.css'

function RedTagHero({ dateRange = 'Oct 9 – Nov 1', formAnchor = '#rte-form' }) {
  return (
    <section className={styles.hero} aria-labelledby="rte-heading">
      <div className={styles.imageCol} aria-hidden="true">
        <img src={heroImg} alt="" className={styles.image} />
      </div>

      <div className={styles.contentCol}>
        <div className={styles.logoDate}>
          <img src={logoRte} alt="Red Tag Event logo" className={styles.logo} />
          <span className={styles.dateRange}>{dateRange}</span>
        </div>
        <h1 id="rte-heading" className={styles.heading}>
          Red Tag savings are here.
        </h1>
        <a href={formAnchor} className={styles.cta}>
          See deals
        </a>
      </div>
    </section>
  )
}

export default RedTagHero
