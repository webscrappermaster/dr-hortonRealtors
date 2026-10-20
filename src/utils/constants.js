/* Breakpoints — fuente de verdad para JS (matchMedia, hooks responsive).
   Deben mantenerse sincronizados con los comentarios en src/styles/variables.css.
   En CSS usar los mismos valores literales dentro de @media. */

export const BREAKPOINTS = {
  xs:  430,   // ajustes del map-search en pantallas chicas
  sm:  640,   // mobile → tablet
  md:  960,   // transición de .map-search
  lg: 1050,
  xl: 1250,
  xxl: 1400,
}

export const MEDIA = {
  minXs:  `(min-width: ${BREAKPOINTS.xs}px)`,
  minSm:  `(min-width: ${BREAKPOINTS.sm}px)`,
  minMd:  `(min-width: ${BREAKPOINTS.md}px)`,
  minLg:  `(min-width: ${BREAKPOINTS.lg}px)`,
  minXl:  `(min-width: ${BREAKPOINTS.xl}px)`,
  minXxl: `(min-width: ${BREAKPOINTS.xxl}px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
}
