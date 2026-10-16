import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStickyHeader } from '../../../hooks/useStickyHeader'
import { navLinks } from '../data/navigation'
import DrHortonLogo from '../../ui/DrHortonLogo'
import styles from './Header.module.css'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isSticky = useStickyHeader()

  const closeMenu = () => setIsMenuOpen(false)
  const toggleMenu = () => setIsMenuOpen(open => !open)

  return (
    <header
      className={`${styles.header} ${isSticky ? styles.shadowed : ''}`}
    >
      <div className={styles.inner}>
        <Link
          to="/"
          className={styles.logo}
          aria-label="D.R. Horton — America's Builder, ir a inicio"
          onClick={closeMenu}
        >
          <DrHortonLogo />
        </Link>

        <nav
          id="main-nav"
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
          aria-label="Navegación principal"
        >
          <ul className={styles.navList}>
            {navLinks.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className={styles.navLink} onClick={closeMenu}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={styles.hamburger}
          aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={isMenuOpen}
          aria-controls="main-nav"
          onClick={toggleMenu}
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>
      </div>
    </header>
  )
}

export default Header
