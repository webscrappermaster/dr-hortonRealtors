import styles from './ThreeColumnCards.module.css'

function ThreeColumnCards({ cards = [] }) {
  return (
    <div className={styles.grid}>
      {cards.map(card => (
        <article key={card.title} className={styles.card}>
          {card.image && (
            <div className={styles.image}>
              <img src={card.image} alt={card.imageAlt ?? ''} loading="lazy" />
            </div>
          )}
          <div className={styles.content}>
            {card.title && <h2 className={styles.title}>{card.title}</h2>}
            {card.description && <p className={styles.description}>{card.description}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}

export default ThreeColumnCards
