/* Textos y tiles de /customer-care — docs/reference/customer-care/customer-care.html.
   Las rutas /documents-and-guides y /contact-us---property-submittals aún no existen:
   caen en el catch-all ComingSoon del router. */

export const hero = {
  title: 'How can we help?',
}

export const tiles = [
  {
    title: 'I have a warranty request to submit.',
    ctaLabel: 'Submit online',
    href: '/warranty',
  },
  {
    title: "I'm looking for maintenance resources.",
    ctaLabel: 'Search by state',
    href: '/documents-and-guides',
  },
  {
    title: 'I have land to sell to D.R. Horton.',
    ctaLabel: 'Submit online',
    href: '/contact-us---property-submittals',
  },
  {
    title: 'I have another question to ask.',
    ctaLabel: 'Contact us',
    href: '/contact-us-page',
  },
]
