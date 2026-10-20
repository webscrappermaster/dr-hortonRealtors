import styles from './CardGrid.module.css'

/* Contenedor flex-wrap para TileCard (equivalente a `.card-container` del original).
   `columns` controla cuántas tarjetas por fila en desktop (2, 3 o 4);
   en mobile siempre pasa a 1 columna. */

function CardGrid({ children, columns = 3, align = 'center', className = '' }) {
  const classes = [
    styles.grid,
    styles[`cols-${columns}`],
    styles[`align-${align}`],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}

export default CardGrid
