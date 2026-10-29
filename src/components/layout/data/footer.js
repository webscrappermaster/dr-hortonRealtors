import facebookIcon  from '../../../assets/icons/social/facebook.svg'
import instagramIcon from '../../../assets/icons/social/instagram.svg'
import linkedinIcon  from '../../../assets/icons/social/linkedin.svg'
import pinterestIcon from '../../../assets/icons/social/pinterest.svg'

/* Secciones del footer-nav (4 columnas en desktop, acordeón en mobile) */
export const footerSections = [
  {
    id: 'about',
    heading: 'About D.R. Horton',
    links: [
      { label: 'Who we are',        to: '/who-we-are',                                     external: false },
      { label: 'Smart home',        to: '/smart-home',                                     external: false },
      { label: 'Military benefits', to: '/military-benefits',                              external: false },
      { label: 'Submit your story', to: 'https://customerportal.drhorton.com/myStory',     external: true  },
    ],
  },
  {
    id: 'resources',
    heading: 'Resources',
    links: [
      { label: 'Contact',             to: '/contact-us-page',                              external: false },
      { label: 'Careers',             to: '/careers',                                      external: false },
      { label: 'Warranty',            to: '/warranty',                                     external: false },
      { label: 'Investor relations',  to: 'https://investor.drhorton.com/',                external: true  },
    ],
  },
  {
    id: 'finance',
    heading: 'Finance Your Home',
    links: [
      { label: 'DHI Mortgage',   to: 'https://www.dhimortgage.com/affiliate/',                                                                 external: true  },
      { label: 'DHI Title',      to: 'https://www.dhimortgage.com/affiliate/?target=https://www.dhititle.com&return=https://www.drhorton.com/', external: true  },
      { label: 'DRH Insurance',  to: 'https://www.dhimortgage.com/affiliate/?target=https://www.drhortoninsurance.com&return=https://www.drhorton.com/', external: true },
      { label: 'Rental investor', to: '/rentals/rentalinvestor',                                                                               external: false },
    ],
  },
]

/* Legal links — se usan en 2 lugares del footer original (mobile legal + bottom bar) */
export const legalLinks = [
  { label: 'Privacy policy',               to: 'https://privacy-central.securiti.ai/notice-embed/17938b64-dd90-40c9-9e09-65c3b3c39521' },
  { label: 'Terms of use',                 to: 'https://privacy-central.securiti.ai/notice-embed/21af7230-6c7d-4f55-9290-6be8460093e4' },
  { label: 'Your privacy choices',         to: 'https://privacy-central.securiti.ai/notice-embed/b71f350e-1f3e-4f55-be68-25c640b8eb97' },
  { label: 'Legal notices',                to: 'https://privacy-central.securiti.ai/notice-embed/c0f075e6-5f94-4a4f-9ee8-db75a605719f' },
  { label: 'Licensing and state notices',  to: 'https://privacy-central.securiti.ai/notice-embed/9655eea5-e0bb-4316-b240-e410fbac29f6' },
  { label: 'Accessibility',                to: 'https://privacy-central.securiti.ai/notice-embed/14b441ba-161a-4d94-af08-347d23a73f6d' },
  { label: 'EPA Consent Decree',           to: '/epa-consent-decree', internal: true },
]

/* Facebook e Instagram se gestionan en /admin y vienen de useSiteSettings(). */
export { facebookIcon, instagramIcon }

export const staticSocialLinks = [
  { label: 'LinkedIn',  to: 'https://www.linkedin.com/company/dr-horton/', icon: linkedinIcon },
  { label: 'Pinterest', to: 'https://www.pinterest.com/drhortonhomes/',  icon: pinterestIcon },
]

export const siteMapHeading = 'Starting your search? Find your new D.R. Horton home in these areas.'

export const copyright = {
  eho: 'D.R. Horton is an Equal Housing Opportunity Builder.',
  text: '© 2026 D.R. Horton, Inc. All Rights Reserved',
}
