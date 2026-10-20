import { useParams } from 'react-router-dom'
import styles from './ComingSoon.module.css'

/* Página placeholder genérica para rutas aún no implementadas.
   Si se usa en rutas dinámicas /:state o /:state/:area, muestra el nombre
   recibido vía props o lo deduce del slug de la URL. */
function ComingSoon({ title, subtitle }) {
  const params = useParams()
  const slug = params.area ?? params.state
  const prettySlug = slug
    ?.split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  const displayTitle = title ?? (prettySlug ? `${prettySlug}` : 'Coming soon')
  const displaySubtitle = subtitle ?? 'This page is on its way. Check back soon.'

  return (
    <section className={styles.container} aria-labelledby="cs-heading">
      <h1 id="cs-heading" className={styles.heading}>{displayTitle}</h1>
      <p className={styles.subtitle}>{displaySubtitle}</p>
    </section>
  )
}

export default ComingSoon
