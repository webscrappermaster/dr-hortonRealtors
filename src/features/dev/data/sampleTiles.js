import { placeholder } from './placeholders'

/* Tiles de services.html — card-container con 3 internal-tile.
   Copy real del HTML original; CTA externo (dhimortgage, dhititle, drhortoninsurance). */
export const tilesServices = [
  {
    title: "It's more than financing, it's about people.",
    description: "We're here to provide a seamless experience with your financial goals in mind.",
    ctaLabel: 'Finance',
    href: 'https://www.dhimortgage.com/',
    external: true,
    image: placeholder({ label: 'Finance', bg: '#1E3A8A', fg: '#F8FAFC' }),
    imageAlt: '',
  },
  {
    title: "When it's yours, we've got you covered.",
    description: "When it's all said and done, we can assist with title coverage.",
    ctaLabel: 'Ownership',
    href: 'https://www.dhititle.com/',
    external: true,
    image: placeholder({ label: 'Ownership', bg: '#065F46', fg: '#F8FAFC' }),
    imageAlt: '',
  },
  {
    title: "We'll help you keep your peace of mind.",
    description: 'After you buy, we have options to protect your home and possessions.',
    ctaLabel: 'Coverage',
    href: 'https://www.drhortoninsurance.com/',
    external: true,
    image: placeholder({ label: 'Coverage', bg: '#7C2D12', fg: '#F8FAFC' }),
    imageAlt: '',
  },
]

/* Tiles de who-we-are.html — DHI Mortgage / DHI Title / DRH Insurance. */
export const tilesWhoWeAre = [
  {
    title: 'DHI Mortgage',
    description: 'Get a seamless experience with your financial goals in mind.',
    ctaLabel: 'Learn more',
    href: 'https://www.dhimortgage.com/',
    external: true,
  },
  {
    title: 'DHI Title',
    description: "When it's all said and done, you can take care of your title.",
    ctaLabel: 'Learn more',
    href: 'https://www.dhititle.com/',
    external: true,
  },
  {
    title: 'DRH Insurance',
    description: 'Protect your home and possessions with our insurance options.',
    ctaLabel: 'Learn more',
    href: 'https://www.drhortoninsurance.com/',
    external: true,
  },
]

/* Tiles de military-benefits.html — bloque con 3 cards pasivas (sin link). */
export const tilesMilitary = [
  {
    title: 'Ready when you are',
    description:
      "D.R. Horton has homes ready for your move. We don't stop building, so we're here for your change of station or civilian home.",
  },
  {
    title: 'Peace of mind',
    description:
      'New construction means no necessary renovation and an included warranty to provide a safety net for your home.',
  },
  {
    title: 'The value of investment',
    description:
      "When it's time to move, your new home is an investment in your future no matter if you choose to rent out or sell.",
  },
]
