import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteMap from './SiteMap'
import LegalModal from '../../ui/LegalModal'
import {
  footerSections,
  staticSocialLinks,
  facebookIcon,
  instagramIcon,
  copyright,
} from '../data/footer'
import { useSiteSettings } from '../../../hooks/useSiteSettings'
import styles from './Footer.module.css'

/* Link interno (<Link>) o externo (<a target="_blank">). */
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

function SocialList({ className, links }) {
  if (!links.length) return null
  return (
    <ul className={`${styles.social} ${className ?? ''}`} aria-label="Social media">
      {links.map(({ label, to, icon }) => (
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

/* Icono CCPA "Your Privacy Choices" (recreación simplificada del badge oficial) */
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
    <circle cx="7" cy="7" r="3.5" fill="#fff" />
    <path d="M5.2 7.2l1.4 1.4 2.4-2.4" stroke="#06f" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="22" cy="7" r="3.5" fill="#fff" />
    <path d="M20.5 5.5l3 3M23.5 5.5l-3 3" stroke="#06f" strokeWidth="1" fill="none" strokeLinecap="round" />
  </svg>
)

/* Orden exacto de los legales según el live. */
const legalBottom = [
  { label: 'Privacy policy',               to: 'https://privacy-central.securiti.ai/notice-embed/17938b64-dd90-40c9-9e09-65c3b3c39521' },
  { label: 'Terms of use',                 to: 'https://privacy-central.securiti.ai/notice-embed/21af7230-6c7d-4f55-9290-6be8460093e4' },
  { label: 'Your privacy choices',         to: 'https://privacy-central.securiti.ai/notice-embed/b71f350e-1f3e-4f55-be68-25c640b8eb97', withIcon: true },
  { label: 'Legal notices',                to: 'https://privacy-central.securiti.ai/notice-embed/c0f075e6-5f94-4a4f-9ee8-db75a605719f' },
  { label: 'Licensing and state notices',  to: 'https://privacy-central.securiti.ai/notice-embed/9655eea5-e0bb-4316-b240-e410fbac29f6' },
  { label: 'Manage cookies',               to: '#manage-cookies', manage: true },
  { label: 'Accessibility',                to: 'https://privacy-central.securiti.ai/notice-embed/14b441ba-161a-4d94-af08-347d23a73f6d' },
  { label: 'EPA Consent Decree',           to: '/epa-consent-decree', internal: true },
]

/* Un link legal que, en vez de abrir en nueva pestaña, abre el modal con el iframe. */
function LegalLink({ item, onOpenModal }) {
  const ref = useRef(null)
  if (item.internal) return <Link ref={ref} to={item.to}>{item.label}</Link>
  if (item.manage) {
    return (
      <a
        ref={ref}
        href={item.to}
        onClick={(e) => { e.preventDefault(); onOpenModal({ title: item.label, manage: true, triggerRef: ref }) }}
      >
        {item.label}
      </a>
    )
  }
  return (
    <a
      ref={ref}
      href={item.to}
      onClick={(e) => { e.preventDefault(); onOpenModal({ title: item.label, src: item.to, triggerRef: ref }) }}
    >
      {item.label}
    </a>
  )
}

function Footer() {
  const [modal, setModal] = useState(null)
  const openModal = (cfg) => setModal(cfg)
  const closeModal = () => setModal(null)

  const { facebookUrl, instagramUrl } = useSiteSettings()
  const socialLinks = [
    facebookUrl  && { label: 'Facebook',  to: facebookUrl,  icon: facebookIcon  },
    instagramUrl && { label: 'Instagram', to: instagramUrl, icon: instagramIcon },
    ...staticSocialLinks,
  ].filter(Boolean)

  return (
    <footer className={styles.footer} role="contentinfo">
      <SiteMap />

      <div className={styles.topBar}>
        <div className={styles.frame}>
          <SocialList className={styles.socialMobile} links={socialLinks} />

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

                <li className={styles.legalMobile}>
                  <span className={styles.sectionHeading}>Legal Information</span>
                  <ul className={styles.linkList}>
                    {legalBottom.map((link) => (
                      <li key={link.label}>
                        <LegalLink item={link} onOpenModal={openModal} />
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>

            <SocialList className={styles.socialDesktop} links={socialLinks} />
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.frame}>
          <ul className={styles.legalInline}>
            {legalBottom.map((link) => (
              <li key={link.label}>
                {link.withIcon && <PrivacyChoicesIcon />}
                <LegalLink item={link} onOpenModal={openModal} />
              </li>
            ))}
          </ul>

          <div className={styles.copyright}>
            <span className={styles.eho}>{copyright.eho}</span>
            <span className={styles.copySep}>•</span>
            <span>{copyright.text}</span>
          </div>
        </div>
      </div>

      {modal && (
        <LegalModal
          title={modal.title}
          src={modal.src}
          returnFocusTo={modal.triggerRef}
          onClose={closeModal}
        >
          {modal.manage && (
            <div className={styles.cookieNotice}>
              <p>
                Cookie management is not available in this demo build.
                In production this would open the OneTrust consent panel.
              </p>
            </div>
          )}
        </LegalModal>
      )}
    </footer>
  )
}

export default Footer
