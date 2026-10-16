/* TEST TEMPORAL — ImageSlider en contexto RedTag.
   Se moverá a FeatureGrid cuando se construya ese módulo. */
import ImageSlider from '../../components/ui/ImageSlider'
import { redtagSliderImages } from './data/redtagCard'
import styles from './HomePage.module.css'

function HomePage() {
  return (
    <section className={styles.testSection} aria-label="Prueba del ImageSlider">
      <ImageSlider
        images={redtagSliderImages}
        aria-label="Galería de casas RedTag"
        aspectRatio="3/2"
        interval={4000}
        showDots
      />
    </section>
  )
}

export default HomePage
