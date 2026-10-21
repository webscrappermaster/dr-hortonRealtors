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

---

## Pendientes / mejoras futuras

- Portar el modal legal con un `<dialog>` nativo accesible.
- Agregar fuente variable Figtree hosteada localmente (actualmente desde Google Fonts).
- Implementar las páginas internas (hoy sirven ComingSoon).

---

## Herramienta de comparación visual (ronda de ajustes 1)

Se agregó `scripts/screenshot.js` + `npm run screenshots` que:
- Lanza Chromium (Playwright, instalado como devDep).
- Captura la Home propia (`http://localhost:5173`) y la Home original (`original-home.html`) en 1440 / 1024 / 768 / 375 px.
- **Bloquea toda la red externa al capturar el original**: `page.route` aborta cualquier
  URL que no sea `file://` ni `about:`. Así no se ejecutan GTM, OneTrust, Cloudflare,
  accessiBe, Vimeo, Facebook SDK ni fuentes externas. (El original queda sin Decagram y
  renderiza en Arial — la referencia tipográfica son los mockups en `docs/mockups/home/`,
  no el original local.)
- Guarda en `docs/reference/screenshots/` (gitignored).

Uso: `npm run dev` en una terminal + `npm run screenshots` en otra. Opciones:
`--only=ours`, `--only=original`, `--url=http://localhost:5175`.

---

## Correcciones aplicadas en la ronda 1

### Hero
- **Eliminada** la tarjeta blanca flotante con sombra sobre la foto.
- Contenedor gris `#F1F1F1` con `border-radius: 20px` y sombra sutil
  (`0 3px 6px rgba(0,0,0,0.08) + 0 2px 4px rgba(0,0,0,0.12)` del CSS original),
  margen lateral `~25px`.
- Imagen de fondo con `object-position: right` para que la foto de familia quede
  a la derecha; el texto ocupa la mitad izquierda sin superposición real
  (la composición original ya trae espacio en blanco a la izquierda).
- Botón "Map view": fondo blanco, borde `2px solid #00205B`, texto navy bold,
  forma pill, outline en hover — valores de `.btn.white` del original.
- Buscador: borde `1px solid #CCCCCC`, placeholder gris claro, altura reducida.

### FeatureGrid
- **Eliminados** los cuadritos azules que yo había pintado antes del título.
  La clase `top-squares` del original **solo** aplica `padding-right: 40%`, no dibuja
  nada. Nosotros usamos `padding-right: 25%` sobre el `h2` para no partir los títulos
  en 3-4 líneas en nuestro grid más estrecho.
- **Eliminada** la flecha `→` de los CTA. Ahora son texto azul (`#0a51c5`) bold de
  15px con underline que aparece en hover (pseudo-elemento con transición de opacidad).
- Border-radius de las tarjetas: `15px` (antes `8px`).
- Sombra más suave: `0 1px 6px rgba(0,0,0,0.06) + 0 2px 8px rgba(0,0,0,0.08)`.
- Hover: `0 10px 20px rgba(0,0,0,0.10) + 0 6px 6px rgba(0,0,0,0.12)`.
- Contenido con `margin-top: auto` (= `align-self: flex-end` del original) para
  quedar alineado al fondo de cada tile.
- Títulos a `19px`, descripción a `15px` (del CSS original).

### Footer
- **SiteMap**: migrado de `grid-template-columns` a **CSS multi-column (`columns: 5`)**.
  Así los estados fluyen column-major (Alabama, Arizona, Arkansas... en la 1ª columna)
  tal como el original. Breakpoints: 1 → 2 → 3 → 5 columnas.
- Estados sin borde, sin ancho fijo. Nombre en `#2D2C2C` bold 16px con chevron pegado
  (`margin-left: 5px`). Hover: underline con pseudo-elemento.
- Chevron: anima `rotateX(180deg)` al abrir (como el original), hover: `scale(1.35)`.
- Título "Starting your search?" a `28px / 800` (del original).
- Línea divisoria gris `#D5D5D5` arriba y abajo del SiteMap y del bottom-bar.
- **Footer nav**: en desktop los títulos de sección (About / Resources / Finance)
  **se ocultan** (`display: none`) — como el original. En mobile sí se muestran como
  acordeón visual.
- Links del nav: gris oscuro `#2D2C2C` medium 16px (ya no azules).
- 3 columnas de links + 4 iconos sociales **en la misma fila** (flex row, align-start).
  Iconos a `34px` con `gap: 16px`.
- **Legal**: 1 sola línea, items separados por `·` (pseudo-elemento `::after`),
  todos en gris oscuro `#2D2C2C` 14px. Sin franja gris, sin título "Legal Information"
  en desktop. Incluye "Manage cookies" (abre un `alert` placeholder sin cargar OneTrust)
  y el badge SVG "Your Privacy Choices" inline.
- EHO + copyright en línea siguiente, mismo tamaño, peso regular.

### Header
- Altura: `74px` desktop, `58px` mobile (antes `76px` fijo). Valores del original.
- Logo: `height: 42px` desktop, `38px` mobile (antes `150px`/`120px` de ancho — era
  gigante). Hover: `scale(1.035)` como el original.
- **Sombra siempre visible**: `0 3px 6px rgba(0,0,0,0.06) × 2` sin importar scroll.
  Antes solo aparecía al hacer scroll.
- Nav font: 15px bold (valor del original).

---

## Diferencias que aún quedan vs. el original

- **Fuente** sigue siendo Figtree ≠ Decagram (comercial, no se puede copiar).
- **"Your Privacy Choices" icon**: usamos un SVG inline simplificado. El original
  usa el badge oficial de la IAB como imagen; nosotros no copiamos activos de terceros.

---

## Correcciones aplicadas en la ronda 2 (referencia: live-hero / live-footer)

### A1 — PromoBar
- Badge "redtag" ahora a `height: 25px` (`--promo-badge-height`, valor real de
  `.banner-logo svg` del original). Flecha a `height: 10px` (`--promo-arrow-height`).
- Barra a `min-height: 45px` con padding `5px 25px`.
- Texto: 16px bold, letter-spacing 0.05em, gap de 10px badge↔texto.

### A2 — Header
- Nav links: `17px / 600 (semibold)` color `#333`, letter-spacing `0.01em`.
- Gap desktop entre items: `28px` + `padding-left: 28px` del nav
  (equivalente a `margin-right: 24px` del `main-nav li` original).

### A3 — Hero
- Contenedor gris `#F1F1F1` ahora VISIBLE (antes la imagen tapaba todo).
  Fix: `<img>` absoluto con `object-fit: contain` + `object-position: right` —
  la foto se pega al borde derecho y el gris queda visible en la zona del texto.
- Padding exterior del hero: `30px` lateral y superior.
- Altura: `60vh` con `min-height: 440px / max-height: 620px` para centrar texto.
- Max-width del frame: `1520px` (como el original) — permite que H1 quepa en 1 línea.
- Title y subtitle con peso 800. Subtitle pegado al title (margin reducido).
- SearchBar: altura `66px`, `border-radius: 43px` (valor real),
  SIN borde, placeholder gris medio `#8A8A8A` 17px, padding-left `28px`.
- Botón Map view: fondo blanco SIN borde, pill, sombra `0 3px 6px rgba(0,0,0,0.16)`,
  texto navy bold 16px, dimensiones `~110×42px`. Hover: sombra más intensa + lift.

### A4 — Footer alineación
- `SiteMap` y `topBar/bottomBar` ahora comparten `padding-inline: 55px` y
  `max-width: 1440px` → título del sitemap, estados, links, sociales y legal
  todo pegado al mismo margen izquierdo/derecho.

### A5 — Footer links y sociales
- Links: `17px / 500` color `#333`, `line-height: 1.3`, `gap: 20px` entre items
  (≈ 39px línea a línea).
- Social icons: `34px × 34px` con `gap: 34px`.
- SVGs sociales **reescritos sin círculo de fondo** — ahora son logos sólidos
  en `currentColor` (`#333`) matcheando el live. Pinterest ya no tiene fondo blanco.

### A6 — Footer legal
- **Eliminado** el `border-top` del bottom-bar — ya no hay línea gris encima.
- Separador cambió de `·` a `•` (bullet) con `margin: 0 10px`.
- Orden exacto: Privacy policy • Terms of use • [icono] Your privacy choices •
  Legal notices • Licensing and state notices • Manage cookies • Accessibility •
  EPA Consent Decree.
- Icono "Your privacy choices": SVG inline `30×14` — pill azul `#06f` con círculo
  blanco ✓ a la izquierda y círculo blanco ✗ a la derecha (recreación del badge
  CCPA oficial). Posicionado **a la izquierda** del texto.
- Tamaño: `15px / #333`. EHO y copyright a `15px / regular` separados por `•`.

### B1 — Modal legal
- `src/components/ui/LegalModal/` con `<dialog>` nativo accesible:
  - `showModal()` → foco atrapado dentro, Escape nativo del dialog, clic en backdrop
    cierra, foco devuelto al link que lo abrió (`returnFocusTo`), scroll del body
    bloqueado (`useBodyScrollLock`).
  - Carga el notice en un iframe apuntando al mismo URL `privacy-central.securiti.ai`
    del original.
  - Botón close con aria-label.
- "Manage cookies" abre el modal con un mensaje placeholder (sin cargar OneTrust).
- "EPA Consent Decree" sigue siendo navegación interna con `<Link>`.

### B2 — Title en 1 línea
- Max-width del frame del hero subido a `1520px` como el original. H1 ahora cabe
  en 1 línea en 1440 y 1250.

### B3 — Capturas con Vimeo
- `scripts/screenshot.js` acepta `--wait-iframes` (opcional, valor en ms, default 5000).
  Espera a que los iframes terminen de cargar antes de capturar. Usado en las
  capturas finales → la tarjeta Red Tag muestra el video real de Vimeo.

### B4 — Pesos
- H1 y H2 del hero: `800` (extrabold). Título del SiteMap también `800`. Matchean el live.

---

## Páginas internas implementadas (Etapas 2–4)

Cada ruta dejó de servir `ComingSoon` y tiene su propio módulo en `src/features/`.

| Ruta | Módulo | Componentes clave |
|---|---|---|
| `/who-we-are` | `who-we-are` | `InternalPageHero` (sm), `ImageTextBlock`, `SliderCards` |
| `/customer-care` | `customer-care` | `InternalPageHero` (md), `CardGrid + TileCard`, `FormField / FormSelect` |
| `/smart-home` | `smart-home` | `InternalPageHero` (md, left), slider de dispositivos, grid de features |
| `/real-estate-agents` | `real-estate-agents` | hero con título grande en 2 líneas, collage, 3 tarjetas |
| `/military-benefits` | `military-benefits` | lead `ImageTextBlock`, 3 TileCards, testimonial, VA Loans, `MilitaryBenefitsForm` |
| `/red-tag-event` | `red-tag-event` | `InternalPageHero`, `RedTagForm` (simulado, validación accesible) |

Formularios simulados: validación en cliente (requeridos, email, teléfono con máscara),
mensajes de error accesibles (`aria-invalid`, `aria-describedby`), mensaje de agradecimiento
al enviar. Sin envío ni persistencia de datos.

### Decisiones compartidas

- `InternalPageHero`: 3 variantes de tamaño (`sm` / `md` / `lg`) y alineación (`left` / `center`).
- `ImageTextBlock`: prop `ctaVariant="plain"` para botones sin uppercase ni letter-spacing; `iconVariant="logo"` para logos anchos (DHI Mortgage, ≤200px).
- `useForm(INITIAL, RULES)`: hook genérico de formulario. Para campos condicionales (instalaciones militares) se usa estado local extra.
- `scripts/screenshot.js` acepta `--pages=slug:path` (slug es el nombre del directorio de referencia, path es la ruta en el dev server; ej: `home:/`).

---

## Pendientes documentados (B5) — no se hacen ahora

- **SearchBar contra API real**: cuando exista backend; hoy busca contra
  `statesIndex.js` local.
- **Fuente Figtree servida localmente** (hoy desde Google Fonts) — para evitar la
  dependencia de red y mejorar FOIT/FOUT.
