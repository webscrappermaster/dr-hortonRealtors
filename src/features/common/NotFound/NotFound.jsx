import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

function NotFound() {
  return (
    <section className={styles.container} aria-labelledby="nf-heading">
      <h1 id="nf-heading" className={styles.heading}>Page not found</h1>
      <p className={styles.subtitle}>
        We can’t find what you’re looking for. Try returning to the home page.
      </p>
      <Link to="/" className={styles.cta}>Back to home</Link>
    </section>
  )
}

export default NotFound
