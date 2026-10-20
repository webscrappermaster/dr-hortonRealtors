import { Link } from 'react-router-dom'
import SiteMap from './SiteMap'
import {
  footerSections,
  legalLinks,
  socialLinks,
  copyright,
} from '../data/footer'
import styles from './Footer.module.css'

/* Renderiza un link interno (<Link>) o externo (<a target="_blank">) */
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

function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <SiteMap />

      <div className={styles.topBar}>
        <div className={styles.frame}>
          <SocialList className={styles.socialMobile} />

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

              {/* La columna "Legal Information" se muestra junto a las otras 3 en mobile */}
              <li className={styles.legalMobile}>
                <span className={styles.sectionHeading}>Legal Information</span>
                <ul className={styles.linkList}>
                  {legalLinks.map((link) => (
                    <li key={link.label}>
                      <FooterLink item={link} />
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>

          <SocialList className={styles.socialDesktop} />
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.frame}>
          <div className={styles.legalDesktop}>
            <span className={styles.sectionHeading}>
              <strong>Legal Information</strong>
            </span>
            <ul className={styles.legalInline}>
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink item={link} />
                </li>
              ))}
            </ul>
          </div>

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
