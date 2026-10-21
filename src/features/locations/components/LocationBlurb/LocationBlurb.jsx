import styles from './LocationBlurb.module.css'

function LocationBlurb({ html }) {
  if (!html) return null
  return (
    <section className={styles.blurb} aria-label="About this area">
      <div
        className={styles.body}
        /* dangerouslySetInnerHTML solo recibe contenido del JSON del proyecto,
           no de input del usuario. */
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}

export default LocationBlurb
