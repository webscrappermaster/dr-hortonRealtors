/* /dev/components — página demo temporal para validar los componentes
   de la etapa 1 con datos de ejemplo tomados de las referencias
   (services, who-we-are, military-benefits).
   TEMPORAL: eliminar junto con la ruta al final del proyecto. */

import Breadcrumbs from '../../components/ui/Breadcrumbs'
import InternalPageHero from '../../components/ui/InternalPageHero'
import TileCard from '../../components/ui/TileCard'
import CardGrid from '../../components/ui/CardGrid'
import CollageGrid from '../../components/ui/CollageGrid'
import ImageTextBlock from '../../components/ui/ImageTextBlock'
import { tilesServices, tilesWhoWeAre, tilesMilitary } from './data/sampleTiles'
import { collageServices, collageWhoWeAre } from './data/sampleCollages'
import { militaryLead } from './data/sampleImageText'
import styles from './ComponentsPreviewPage.module.css'

function Section({ id, title, source, children }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <header className={styles.sectionHeader}>
        <h2 id={id} className={styles.sectionTitle}>
          {title}
        </h2>
        <p className={styles.sectionSource}>Fuente: {source}</p>
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  )
}

function ComponentsPreviewPage() {
  return (
    <div className={styles.page}>
      <div className={styles.banner} role="note">
        <strong>Página temporal.</strong> Vive solo durante el desarrollo
        y se elimina junto con <code>/dev/components</code> al final del proyecto.
      </div>

      <Section
        id="breadcrumbs"
        title="Breadcrumbs"
        source="area-atlanta.html → <nav class='breadcrumbs locationpage'>"
      >
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Georgia', to: '/georgia' },
            { label: 'Atlanta Area' },
          ]}
        />
      </Section>

      <Section
        id="internal-hero"
        title="InternalPageHero"
        source="services.html, who-we-are.html, military-benefits.html"
      >
        <InternalPageHero
          size="md"
          title={<>We keep home in the family.</>}
          description="Buy, mortgage, title, and insurance. All under one roof."
        />
        <InternalPageHero
          size="sm"
          align="center"
          title="Together, we are America's builder."
          subtitle="We're building every day."
        />
        <InternalPageHero
          size="sm"
          eyebrow="New homes for military buyers"
          title="We're proud to build for those who serve."
          description="When it comes to your PCS or transition to civilian life, there are many things to consider. Luckily, D.R. Horton is there when you're on the move."
        />
      </Section>

      <Section
        id="tilecards"
        title="TileCard + CardGrid"
        source="services.html (Finance/Ownership/Coverage), military-benefits.html (3 tiles), who-we-are.html (DHI Mortgage/Title/DRH Insurance)"
      >
        <h3 className={styles.subtitle}>Services (3 columnas con CTA externo)</h3>
        <CardGrid columns={3}>
          {tilesServices.map(tile => (
            <TileCard key={tile.title} {...tile} />
          ))}
        </CardGrid>

        <h3 className={styles.subtitle}>Who we are (3 columnas, links externos)</h3>
        <CardGrid columns={3}>
          {tilesWhoWeAre.map(tile => (
            <TileCard key={tile.title} {...tile} />
          ))}
        </CardGrid>

        <h3 className={styles.subtitle}>Military benefits (3 columnas pasivas, sin link)</h3>
        <CardGrid columns={3}>
          {tilesMilitary.map(tile => (
            <TileCard key={tile.title} {...tile} />
          ))}
        </CardGrid>
      </Section>

      <Section
        id="collage"
        title="CollageGrid"
        source="services.html (services-collage collage-right), who-we-are.html (collage collage-top1)"
      >
        <h3 className={styles.subtitle}>Services collage (3 columnas)</h3>
        <CollageGrid columns={collageServices} />

        <h3 className={styles.subtitle}>Who we are collage (3 columnas con offsets)</h3>
        <CollageGrid columns={collageWhoWeAre} />
      </Section>

      <Section
        id="image-text"
        title="ImageTextBlock"
        source="military-benefits.html (lead-block, imagen a la derecha)"
      >
        <ImageTextBlock {...militaryLead} />

        <h3 className={styles.subtitle}>Variante — imagen a la izquierda</h3>
        <ImageTextBlock {...militaryLead} imageSide="left" variant="default" />
      </Section>
    </div>
  )
}

export default ComponentsPreviewPage
