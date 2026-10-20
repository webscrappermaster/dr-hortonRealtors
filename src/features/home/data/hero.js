import heroDesktop from '../../../assets/images/hero/rte-header-desktop.webp'
import heroMobile from '../../../assets/images/hero/rte-header-mobile.webp'

export const heroData = {
  image: {
    desktop: heroDesktop,
    mobile: heroMobile,
    alt: 'Hero image',  /* el original usa este alt tal cual */
  },
  heading: 'Red Tag Savings are here.',
  subheading: 'Shop move-in ready homes by November 1.',
  search: {
    placeholder: 'Search by zip, city, state, or community',
    ariaLabel: 'Search by zip, city, state, or community',
  },
  mapButton: {
    label: 'Map view',
    to: '/globalmap',
    ariaLabel: 'Open interactive map view',
  },
}
