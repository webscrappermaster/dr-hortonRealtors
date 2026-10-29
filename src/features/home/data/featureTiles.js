import slide1 from '../../../assets/images/redtag-slider/02b-redtag-slider-1.webp'
import slide2 from '../../../assets/images/redtag-slider/02b-redtag-slider-2.webp'
import slide3 from '../../../assets/images/redtag-slider/02b-redtag-slider-3.webp'
import slide4 from '../../../assets/images/redtag-slider/02b-redtag-slider-4.webp'

/* Tarjeta grande "Red Tag Event" — iframe Vimeo del original.
   Si el usuario tiene prefers-reduced-motion, se muestran estas slides. */
export const redTagTile = {
  kind: 'vimeo',
  vimeoId: '1204948807',
  vimeoTitle: 'RTE-Sign_Q426',
  heading: 'Better pricing. Extra perks. More ways to save.',
  description: "The Red Tag Event brings big savings for a limited time. See what's available near you.",
  cta: {
    label: 'See deals',
    to: '/red-tag-event',
    external: false,
    ariaLabel: 'Red Tag Event: see deals on move-in ready homes.',
  },
  fallbackSlides: [
    { src: slide1, alt: 'Vista frontal de una casa D.R. Horton con cartel Red Tag' },
    { src: slide2, alt: 'Casa Red Tag con descuento sobre la fachada' },
    { src: slide3, alt: 'Casa Red Tag en comunidad D.R. Horton' },
    { src: slide4, alt: 'Casa D.R. Horton nueva incluida en el Red Tag Event' },
  ],
}

/* 4 tarjetas de la cuadrícula secundaria (2 columnas x 2 filas). */
export const secondaryTiles = [
  {
    id: 'smart-home',
    heading: 'Stay connected to home.',
    description: "Check out what's behind the door of America's Smart Home.",
    hasTopSquares: true,
    cta: {
      label: 'Learn more',
      to: '/smart-home',
      external: false,
      ariaLabel: 'Stay connected to home. Learn more',
      title: 'Opens a new window',
    },
  },
  {
    id: 'real-estate-agents',
    heading: 'We ❤ real estate agents',
    hasHeart: true,
    hasTopSquares: true,
    description: "We want to work with you to find your clients' new homes.",
    cta: {
      label: 'Work with us',
      to: '/real-estate-agents',
      external: false,
      ariaLabel: 'We love real estate agents. Work with us',
      title: 'Opens a new window',
    },
  },
  {
    id: 'military-benefits',
    heading: 'Military buyers',
    description: "We're proud to build homes for those who serve.",
    hasTopSquares: true,
    cta: {
      label: 'Find your home',
      to: '/military-benefits',
      external: false,
      ariaLabel: 'Find your home',
      title: 'Opens a new window',
    },
  },
  {
    id: 'submit-story',
    heading: 'Submit your story',
    description: "We all love to see our homebuyers' smiling faces.",
    cta: {
      label: 'Tell your story',
      to: 'https://customerportal.drhorton.com/myStory',
      external: true,
      ariaLabel: 'Submit your story. Tell your story',
      title: 'Opens a new window',
    },
  },
]
