import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStickyHeader } from '../../../hooks/useStickyHeader'
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { navLinks } from '../data/navigation'
import DrHortonLogo from '../../ui/DrHortonLogo'
import styles from './Header.module.css'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isSticky = useStickyHeader()
  const headerRef = useRef(null)

  const closeMenu = () => setIsMenuOpen(false)
  const toggleMenu = () => setIsMenuOpen(open => !open)

  useBodyScrollLock(isMenuOpen)
  useOnClickOutside(headerRef, closeMenu, isMenuOpen)
  /* El cierre del menú en navegación se garantiza vía onClick={closeMenu} en
     todos los <Link> internos; Escape y clic fuera lo cierran también. */

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <header
        ref={headerRef}
        className={`${styles.header} ${isSticky ? styles.shadowed : ''}`}
      >
        <div className={styles.inner}>
          <div className={styles.left}>
            <button
              type="button"
              className={styles.hamburger}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="main-nav"
              onClick={toggleMenu}
            >
              <span className={`${styles.bar} ${isMenuOpen ? styles.barOpen1 : ''}`} />
              <span className={`${styles.bar} ${isMenuOpen ? styles.barOpen2 : ''}`} />
              <span className={`${styles.bar} ${isMenuOpen ? styles.barOpen3 : ''}`} />
            </button>

            <Link
              to="/"
              className={styles.logo}
              aria-label="D.R. Horton — America's Builder, go to home page"
              onClick={closeMenu}
            >
              <DrHortonLogo />
            </Link>

            <nav
              id="main-nav"
              className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
              aria-label="Main navigation"
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
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
