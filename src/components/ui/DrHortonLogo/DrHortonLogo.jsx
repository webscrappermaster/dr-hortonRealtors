import logoUrl from '../../../assets/logo/dr-horton-logo.svg'
import styles from './DrHortonLogo.module.css'

function DrHortonLogo({ className = '' }) {
  return (
    <img
      src={logoUrl}
      alt="D.R. Horton — America's Builder"
      className={`${styles.logo} ${className}`}
    />
  )
}

export default DrHortonLogo
