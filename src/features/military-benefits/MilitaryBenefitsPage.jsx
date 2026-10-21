import ImageTextBlock from '../../components/ui/ImageTextBlock'
import CardGrid from '../../components/ui/CardGrid'
import TileCard from '../../components/ui/TileCard'
import MilitaryBenefitsForm from './components/MilitaryBenefitsForm'
import { lead, tiles, testimonial, vaLoans } from './data/militaryBenefits'
import styles from './MilitaryBenefitsPage.module.css'

function MilitaryBenefitsPage() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>

      <ImageTextBlock
        image={lead.image}
        imageAlt={lead.imageAlt}
        icon={lead.flagIcon}
        iconAlt="U.S. flag icon"
        eyebrow={lead.eyebrow}
        title={lead.heading}
        description={lead.paragraph}
        cta={{ label: lead.cta.label, href: lead.cta.anchor }}
        imageSide="right"
        variant="lead"
        ctaVariant="plain"
      />

      <section className={styles.tiles} aria-label="Military buyer benefits">
        <CardGrid columns={3}>
          {tiles.map(tile => (
            <TileCard
              key={tile.title}
              title={tile.title}
              description={tile.description}
            />
          ))}
        </CardGrid>
      </section>

      <ImageTextBlock
        image={testimonial.image}
        imageAlt={testimonial.imageAlt}
        description={`"${testimonial.quote}"`}
        disclaimer={`— ${testimonial.author}`}
        imageSide="left"
      />

      <ImageTextBlock
        image={vaLoans.image}
        imageAlt={vaLoans.imageAlt}
        icon={vaLoans.logo}
        iconAlt={vaLoans.logoAlt}
        iconVariant="logo"
        title={vaLoans.heading}
        description={vaLoans.paragraph}
        cta={{ label: vaLoans.cta.label, href: vaLoans.cta.href, external: true }}
        imageSide="right"
        ctaVariant="plain"
      />

      <section id="contact-form" className={styles.formSection} aria-labelledby="form-heading">
        <h2 id="form-heading" className={styles.srOnly}>
          Contact us about military benefits
        </h2>
        <MilitaryBenefitsForm />
      </section>

    </main>
  )
}

export default MilitaryBenefitsPage
