# Notas de la Home recreada

Este documento registra decisiones tomadas al portar la Home original
(`original-home.html` + `original-home-files/`) a la app React.

---

## Fuente tipográfica

| Original | Elegida | Razón |
|---|---|---|
| **Decagram** (comercial, no se puede redistribuir) | **Figtree** (Google Fonts) | De las tres candidatas evaluadas contra `docs/mockups/home/01-hero.webp` (Inter, Manrope, Figtree), Figtree es la más próxima: geométrica contemporánea, "a" de doble piso, cortes suaves, pesos marcados — mismo espíritu que Decagram. Inter se ve más estrecha/UI-tech y Manrope es demasiado redondeada. |

Fallbacks (tomados del CSS original):
`'Figtree', 'Helvetica Neue', Helvetica, Arial, sans-serif`.

**Importante:** no se copió ningún archivo `.woff2` de Decagram del sitio original,
aunque estuvieran disponibles vía `main.min.css`.

---

## Conversión de la escala tipográfica

El CSS original aplica `html { font-size: 62.5% }` (root 10px, el conocido "hack" para
que `1rem = 10px`). En este proyecto se mantiene el **100% del navegador** (root 16px por
defecto, respetando la configuración del usuario). Por eso cada valor `rem` del original
se convirtió multiplicando por **0.625**:

| Original | Nuestro | Px |
|---|---|---|
| `1.6rem`  | `1rem`      | 16 |
| `1.7rem`  | `1.0625rem` | 17 (map input) |
| `6.32rem` | `3.95rem`   | 63.2 (power-statement) |

Los pesos relativos entre tamaños se preservan 1:1.

---

## Breakpoints

Los `@media` del original usan los límites: **430 / 640 / 960 / 1050 / 1250 / 1400** px.
Como las custom properties CSS no funcionan dentro de `@media`, están documentados en
dos lugares que deben mantenerse sincronizados:

1. Comentario en `src/styles/variables.css` (sección `── BREAKPOINTS ──`).
2. Objeto exportado en `src/utils/constants.js` (`BREAKPOINTS` + `MEDIA`).

En el CSS siempre se usan **valores literales exactos**, nunca aproximaciones.

---

## Colores reales extraídos del original

- Rojo RedTag: `#D10000` (del inline style de `.red-tag-event` en el HTML).
- Navy DRH: `#00205B` (confirmado también por `leadColor: '#00205b'` en el config de accessiBe).
- Rojo del corazón: `#DA291C` (del `DRH-heart-REA.svg`).
- Fondo del input hero: `#F1F1F1` (del `home.css`).
- Social icons stroke/fill: `#2D2C2C`.

---

## Comportamientos replicados

### PromoBar
Franja roja superior con badge "redtag" (SVG oficial `viewBox 0 0 26 14`), mensaje,
CTA "Act now" y flecha oficial (`viewBox 0 0 15 15`). Enlace a `/red-tag-event`.

### Header
- Logo DRH (SVG oficial), nav (Who we are / Smart home / Services / Customer care).
- Link "Skip to main content" accesible (aparece al enfocar).
- Sticky con sombra al hacer scroll (`useStickyHeader` con estado inicial correcto en refresh).
- Menú mobile: hamburger animado a X, bloquea scroll del body (`useBodyScrollLock`),
  cierra con Escape y clic fuera (`useOnClickOutside`) y con `onClick={closeMenu}` en todos los Link.

### Hero
- `<picture>` con `rte-header-desktop.webp` (fetchpriority=high) y `rte-header-mobile.webp` (≤639px).
- H1 "Red Tag Savings are here." + H2 roja "Shop move-in ready homes by November 1."
- SearchBar como combobox accesible (ARIA 1.2) — ver abajo.
- Botón "Map view" → `/globalmap`.

### SearchBar + useLocationSearch
`SearchBar` es un componente **genérico** en `src/components/ui/`: recibe `suggestions`
y `onSelect` por props. La lógica de búsqueda de estados y mercados vive en el hook
`src/features/locations/hooks/useLocationSearch.js` que aplana `statesIndex.js` y
busca por prefijo (prioritario) + subcadena (secundario), case-insensitive.

- Navegación de teclado: ↑/↓, Home/End, Enter, Escape.
- `aria-expanded`, `aria-activedescendant`, `role="combobox"` / `role="listbox"` / `role="option"`.

### FeatureGrid
- Tarjeta grande "Red Tag" con `VimeoTile` (iframe `background=1&dnt=1`, lazy via IntersectionObserver, fallback `ImageSlider` para `prefers-reduced-motion`).
- 4 tarjetas 2×2: Smart home, We ❤ real estate agents (SVG oficial del corazón), Military buyers, Submit your story.
- Links externos (`customerportal`, `drhorton.com`) abren con `target="_blank"` + `rel="noopener noreferrer"`.

### Footer
- `SiteMap` colapsable: lista de 38 estados en grilla; al clickear el chevron se ocultan los demás, aparece el panel "Areas in <Estado>" con sus mercados y se hace scroll suave. Segundo clic lo cierra. `aria-expanded` y `tabindex="-1"` cuando el ítem está oculto.
- 4 secciones de footer-nav (About, Resources, Finance, Legal Information en mobile).
- `.social` y `.social--mobile` como el original (mobile arriba del nav, desktop a la derecha).
- Bottom bar con "Legal Information" (desktop), copyright y "D.R. Horton is an Equal Housing Opportunity Builder."

### Rutas
- Fijas (ComingSoon): `/who-we-are`, `/smart-home`, `/services`, `/customer-care`, `/red-tag-event`, `/real-estate-agents`, `/military-benefits`, `/globalmap`, `/contact-us-page`, `/careers`, `/warranty`, `/epa-consent-decree`.
- Dinámicas: `/:state` y `/:state/:area` → `LocationPage` resuelve contra `statesIndex.js`, slug válido muestra ComingSoon con el nombre, slug inexistente → NotFound.
- Las fijas tienen prioridad sobre las dinámicas (orden en el array del router).
- `*` → NotFound.
- Scroll al top en cada cambio de ruta (`useScrollToTop` en `MainLayout`).

---

## Pipeline de imágenes

`scripts/optimize-images.js` + `npm run images` (sharp). Convierte .jpg/.png → .webp
con `--width` y `--quality` opcionales. Usado para:
- `RTE-Header-Image-Desktop.jpg` → `rte-header-desktop.webp` (1920w) + `rte-header-mobile.webp` (800w).
- 4 slides del Red Tag Event (fallback de `prefers-reduced-motion`).

Reutilizable para los próximos módulos.

---

## Pipeline de datos

`scripts/extract-states.js` parsea `original-home.html` y regenera
`src/features/locations/data/statesIndex.js` con 38 estados y 157 mercados.
No editar el archivo generado a mano: correr `node scripts/extract-states.js` si cambia
el HTML original.

---

## Scripts del sitio original NO portados (por seguridad)

El HTML original incluye:
- Google Tag Manager (`gtm.js`, `gtm(1).js`)
- OneTrust Cookies Consent (`otSDKStub.js`, `otBannerSdk.js`)
- jQuery 3.6 + jQuery global (`jquery.min.js`, `jquery-3.6.0.min.js`)
- Cloudflare bot management (`api.js`)
- Facebook SDK (`fbc(...)`)
- accessiBe (`acsbapp.com/apps/app/dist/js/app.js`)
- `drhorton.web.min.js` (bundle propietario del sitio)

**Ninguno se copió** al proyecto. Todo el comportamiento interactivo se reimplementa
en React con hooks propios. El sitio no se sirve: Vite bloquea `/docs` vía
`server.fs.allow` y Vite scanea solo `index.html` como entry.

---

## Diferencias conocidas vs. el original

- **Fuente:** Figtree en vez de Decagram (ver tabla al inicio).
- **Tipografía escalada ×0.625:** mantenemos root 16px por accesibilidad; medidas visuales equivalentes.
- **Hero SearchBar:** el original monta un bundle externo
  (`community-finder-search-box.aa4bac22.js`) que resuelve autocomplete contra una API
  interna. Nosotros buscamos en memoria contra `statesIndex.js`. Suficiente para
  demostrar el patrón; se puede migrar a un endpoint real sin tocar el componente.
- **Vimeo:** `background=1&dnt=1` + `loading="lazy"` + IntersectionObserver (200px margin).
  En conexiones muy lentas el iframe puede tardar en aparecer; eso es intencional.
- **CTA del Red Tag ("See deals"):** el original usa `target="_blank"` apuntando a
  `https://www.drhorton.com/red-tag-event` incluso dentro del propio sitio; mantenemos
  ese comportamiento tal cual (externo con `rel="noopener noreferrer"`).
- **`site-alert` → PromoBar:** el original lo renderiza como `<button>` con
  `data-link`; nosotros usamos `<Link>` dentro de un `<div role="complementary">`.
  Semánticamente correcto y accesible (los lectores reconocen el enlace).
- **Modal legal:** el original tiene un lightbox + iframe para notices legales
  (`#legal-modal`); todavía no está portado — los legal links abren en nueva pestaña
  directamente al mismo URL de securiti.ai que usaría el iframe.

---

## Pendientes / mejoras futuras

- Portar el modal legal con un `<dialog>` nativo accesible.
- Agregar fuente variable Figtree hosteada localmente (actualmente desde Google Fonts).
- Más tests responsive sistemáticos (375, 768, 1024, 1440). El build pasa; falta validar visualmente cada breakpoint con capturas.
- Implementar las páginas internas (hoy sirven ComingSoon).
