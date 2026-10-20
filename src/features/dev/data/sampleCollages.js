import { placeholder } from './placeholders'

/* Collage inspirado en services.html (services-collage collage-right, 3 columnas). */
export const collageServices = [
  [
    { src: placeholder({ label: 'SC Family',   bg: '#1E40AF' }), alt: 'South Carolina Family' },
    { src: placeholder({ label: 'Seattle',     bg: '#0E7490' }), alt: 'Seattle Tradition' },
  ],
  [
    { src: placeholder({ label: 'Phoenix',     bg: '#B45309' }), alt: 'Phoenix Exterior' },
    { src: placeholder({ label: 'Hawaii',      bg: '#15803D' }), alt: 'Hawaii Family' },
    { src: placeholder({ label: 'Florida',     bg: '#0369A1' }), alt: 'Florida One-Story' },
  ],
  [
    { src: placeholder({ label: 'Central Valley', bg: '#92400E' }), alt: 'Central Valley Home' },
    { src: placeholder({ label: 'Austin',         bg: '#4C1D95' }), alt: 'Austin Welcome Home' },
  ],
]

/* Collage inspirado en who-we-are.html (collage collage-top1, 3 columnas con offsets). */
export const collageWhoWeAre = [
  [
    { src: placeholder({ label: 'Maryland',  bg: '#334155' }), alt: 'Maryland Tradition Exterior' },
    { src: placeholder({ label: 'Hardin',    bg: '#7C2D12' }), alt: 'Hardin family' },
  ],
  [
    { src: placeholder({ label: 'Florida TH', bg: '#065F46' }), alt: 'Florida townhome' },
    { src: placeholder({ label: 'Hoopili',    bg: '#1E3A8A' }), alt: 'Guillermo and Acacio', offsetY: -24 },
    { src: placeholder({ label: 'Oregon',     bg: '#166534' }), alt: 'Oregon Tradition exterior' },
  ],
  [
    { src: placeholder({ label: 'WA Woodcrest', bg: '#0F172A' }), alt: 'WA Woodcrest Exterior' },
    { src: placeholder({ label: 'Nashville',    bg: '#78350F' }), alt: 'Nashville Model' },
  ],
]
