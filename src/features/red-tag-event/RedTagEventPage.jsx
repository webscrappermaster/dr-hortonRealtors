import RedTagHero from './components/RedTagHero'
import RedTagForm from './components/RedTagForm'
import styles from './RedTagEventPage.module.css'

function RedTagEventPage() {
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <RedTagHero />
      <RedTagForm />
    </main>
  )
}

export default RedTagEventPage
