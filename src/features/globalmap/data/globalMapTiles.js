/* Tarjeta grande — video "D.R. Horton Homes" con patrón facade (Vimeo ID 794962074).
   El iframe solo se inyecta al hacer clic del usuario (sin autoplay, sin cookies previas). */
export const videoTile = {
  vimeoId:    '794962074',
  vimeoTitle: 'D.R. Horton Homes',
  heading:    'D.R. Horton Homes.',
  description:
    'We are America’s Builder. Since 2002, more homebuyers have chosen D.R. Horton than any other builder in America.',
  cta: {
    label: 'Find out who we are',
    to:    'https://www.drhorton.com/who-we-are',
  },
}

/* 4 tarjetas secundarias (2 columnas × 2 filas). */
export const secondaryTiles = [
  {
    id:           'smart-home',
    heading:      'Stay connected to home.',
    description:  'Check out what’s behind the door of America’s Smart Home.',
    hasTopSquares: true,
    cta: {
      label:    'Learn more',
      to:       '/smart-home',
      external: false,
    },
  },
  {
    id:           'real-estate-agents',
    heading:      'We ❤ real estate agents',
    hasHeart:      true,
    hasTopSquares: true,
    description:  'We want to work with you to find your clients’ new homes.',
    cta: {
      label:    'Work with us',
      to:       '/real-estate-agents',
      external: false,
    },
  },
  {
    id:           'rental-homes',
    heading:      'Rental homes',
    hasTopSquares: true,
    description:  'We have more options for you to call home.',
    cta: {
      label:    'Search now',
      to:       'https://www.drhorton.com/rental-homes',
      external: true,
    },
  },
  {
    id:          'submit-story',
    heading:     'Submit your story',
    description: 'We all love to see our homebuyers’ smiling faces.',
    cta: {
      label:    'Tell your story',
      to:       'https://customerportal.drhorton.com/myStory',
      external: true,
    },
  },
]
