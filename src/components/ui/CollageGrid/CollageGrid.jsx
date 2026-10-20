import styles from './CollageGrid.module.css'

/* CollageGrid — grilla de imágenes al estilo `.collage` del original.
   Recibe un array de columnas; cada columna es un array de imágenes
   { src, alt, offsetY? } con alturas distintas para generar el efecto escalonado.

   Ejemplo (3 columnas): [
     [{ src, alt }, { src, alt }],
     [{ src, alt }, { src, alt }, { src, alt }],
     [{ src, alt, offsetY: -40 }, { src, alt }],
   ] */

function CollageGrid({ columns = [], align = 'center', className = '' }) {
  const classes = [styles.collage, styles[`align-${align}`], className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role="presentation">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className={styles.column}>
          {col.map((img, imgIdx) => (
            <div
              key={imgIdx}
              className={styles.item}
              style={img.offsetY ? { marginTop: `${img.offsetY}px` } : undefined}
            >
              <img src={img.src} alt={img.alt ?? ''} loading="lazy" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default CollageGrid
