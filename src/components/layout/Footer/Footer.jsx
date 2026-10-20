import { Link } from 'react-router-dom'
import SiteMap from './SiteMap'
import {
  footerSections,
  legalLinks,
  socialLinks,
  copyright,
} from '../data/footer'
import styles from './Footer.module.css'

/* Link interno (<Link>) o externo (<a target="_blank">) */
function FooterLink({ item }) {
  if (item.external || /^https?:/.test(item.to)) {
    return (
      <a
        href={item.to}
        target="_blank"
        rel="noopener noreferrer"
        title={`${item.label}. Opens a new window`}
      >
        {item.label}
      </a>
    )
  }
  return <Link to={item.to}>{item.label}</Link>
}

function SocialList({ className }) {
  return (
    <ul className={`${styles.social} ${className ?? ''}`} aria-label="Social media">
      {socialLinks.map(({ label, to, icon }) => (
        <li key={label}>
          <a
            href={to}
            target="_blank"
            rel="noopener noreferrer"
            title="Opens a new window"
            aria-label={label}
            className={styles.socialIcon}
          >
            <img src={icon} alt="" />
          </a>
        </li>
      ))}
    </ul>
  )
}

/* Placeholder para "Manage cookies" (sin OneTrust). */
function handleManageCookies(event) {
  event.preventDefault()
  window.alert('Cookie preferences — placeholder.\nEn producción esto abriría el banner de OneTrust.')
}

/* Pequeño icono "Your privacy choices" (azul + blanco) tomado del CSS original. */
const PrivacyChoicesIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="30"
    height="14"
    viewBox="0 0 30 14"
    className={styles.privacyIcon}
  >
    <rect width="30" height="14" rx="2" fill="#06f" />
    <text x="4" y="10" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">
      Your Privacy Choices
    </text>
  </svg>
)

function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <SiteMap />

      <div className={styles.topBar}>
        <div className={styles.frame}>
          <SocialList className={styles.socialMobile} />

          <div className={styles.topRow}>
            <nav className={styles.footerNav} aria-label="Footer navigation">
              <ul className={styles.sectionsList}>
                {footerSections.map((section) => (
                  <li key={section.id}>
                    <span className={styles.sectionHeading}>{section.heading}</span>
                    <ul className={styles.linkList}>
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <FooterLink item={link} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}

                {/* Legal column — solo visible en mobile */}
                <li className={styles.legalMobile}>
                  <span className={styles.sectionHeading}>Legal Information</span>
                  <ul className={styles.linkList}>
                    {legalLinks.map((link) => (
                      <li key={link.label}>
                        <FooterLink item={link} />
                      </li>
                    ))}
                    <li>
                      <a href="#manage-cookies" onClick={handleManageCookies}>Manage cookies</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>

            <SocialList className={styles.socialDesktop} />
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.frame}>
          <ul className={styles.legalInline}>
            {legalLinks.slice(0, 2).map(link => (
              <li key={link.label}><FooterLink item={link} /></li>
            ))}
            <li>
              <a href="#your-privacy-choices" onClick={(e) => e.preventDefault()}>
                Your privacy choices <PrivacyChoicesIcon />
              </a>
            </li>
            {legalLinks.slice(3).map(link => (
              <li key={link.label}><FooterLink item={link} /></li>
            ))}
            <li>
              <a href="#manage-cookies" onClick={handleManageCookies}>Manage cookies</a>
            </li>
          </ul>

          <div className={styles.copyright}>
            <span className={styles.eho}>{copyright.eho}</span>
            {copyright.text}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
