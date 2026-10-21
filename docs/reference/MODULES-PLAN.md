# Plan de módulos — Páginas internas D.R. Horton

Base: 14 referencias en `docs/reference/` ya normalizadas a `<carpeta>/<carpeta>.html` + `<carpeta>-files/`, con rutas internas reescritas. Ningún archivo original se sirve ni se importa: solo son referencia visual/estructural.

Comparativa de CSS: los 14 `main.min.css` son idénticos entre sí y a la Home original (1 211 530 bytes). Los únicos CSS adicionales relevantes son:
- `warranty-files/dropzone.css` (12 KB) y `easy-autocomplete.min.css` (8 KB) — para el form de garantía.
- `community-jackson-landing-files/styles.3f5ef51b98569be6.css` (238 KB) — bundle del cliente SPA que renderiza listados móviles del community page. No se adopta; nos basta la estructura HTML visible.
- `customform.css` en varias carpetas es un placeholder vacío (51 bytes).

---

## 1 · Inventario de las 14 páginas

| # | Página | Ruta propuesta | Tipo | Secciones principales (orden) | Componentes nuevos | Dificultad |
|---|---|---|---|---|---|---|
| 1 | state-georgia | `/:state` (`/georgia`) | **Plantilla estado** | breadcrumbs → results header (filter · sort · map · RFI) → grid de CommunityCard → paginación → area-blurb al pie | Breadcrumbs, LocationResultsHeader, CommunityCard, Pagination, LocationBlurb, RFIModal, LocationMapPlaceholder | Alta |
| 2 | area-atlanta | `/:state/:area` (`/georgia/atlanta`) | **Plantilla área** | igual que estado pero con breadcrumbs de 3 niveles y H1 "Find Your New Home in Atlanta, GA" | reutiliza todo lo del estado | Alta |
| 3 | community-jackson-landing | `/:state/:area/:city/:community` | **Plantilla comunidad** | breadcrumbs → gallery (7 fotos) → bloque price/series/address/stats → aside (hours · tel · "Request a tour" · "Text With Us") → promo card (RTE) → about → amenities (expand) → schools → lot-map banner → floor plans grid → available homes grid → related move-ins | PropertyGallery, CommunityHero, CommunityAside, PromoCard, AmenitiesList, SchoolsList, LotMapBanner, FloorPlanCard, AvailableHomeCard | Alta |
| 4 | who-we-are | `/who-we-are` | Estática | collage superior → "Together, we are America's builder" → "We're building every day" → cards 3× (DHI Mortgage · DHI Title · DRH Insurance) → CTA Join the team → logo HFES | CollageGrid, InternalPageHero, TileCard, CardGrid | Media |
| 5 | smart-home | `/smart-home` | Estática | title "America's smart home®" → slick carousel de dispositivos (Smart Switch · Doorbell · Qolsys · Alarm.com · Honeywell · HomeConnect) → 3 tiles (You'll never be far / Hands-free / No more boxes) | SliderCards (carousel), TileCard, CardGrid | Media |
| 6 | services | `/services` | Estática | title + collage derecho → 3 TileCard (Finance · Ownership · Coverage) | CollageGrid, TileCard, InternalPageHero | Baja |
| 7 | customer-care | `/customer-care` | Estática | H1 "How can we help?" → 4 TileCard grandes (warranty · maintenance · property submittals · contact-us) | TileCard, CardGrid | Baja |
| 8 | red-tag-event | `/red-tag-event` | Estática + form | hero asimétrico (imagen izquierda, logo + fecha + CTA) → "Find deals on homes near you" form (State · AreaOfInterest · City · "I am a" · Moving in · Nombre · Email · Teléfono) → "Current inventory" CTA → disclaimer legal | RedTagHero, RedTagForm | Media |
| 9 | real-estate-agents | `/real-estate-agents` | Estática | hero half-video (texto + video embed) → callout "Want to partner with us?" con collage 3×2 → three-column cards (We've got options · We don't stop · We love to work together) → "Partner with D.R. Horton" copy | HalfVideoHero, ThreeColumnCards, ImageTextBlock, CollageGrid | Media |
| 10 | military-benefits | `/military-benefits` | Estática + form | ImageTextBlock lead ("We're proud to build") → 3 TileCard (Ready · Peace · Investment) → bloques programs → ImageTextBlock "find-branch" → ContactForm (First · Last · Email · Phone · Military branch · Current status · Installation options×6) | ImageTextBlock, TileCard, MilitaryBenefitsForm | Media |
| 11 | globalmap | `/globalmap` | Dinámica (compleja) | search box top → mapa Google full-width (clusters de comunidades) → home-tiles grid (video "D.R. Horton Homes" · Stay connected · We ♥ real estate agents · Rental homes · Submit your story) | GlobalMapPlaceholder, HomeTilesGrid (prácticamente reutiliza FeatureGrid del home) | Alta |
| 12 | contact | `/contact-us-page` | Estática + form | CareTabs (Warranty · Maintenance · Property submittal · Contact us, seleccionada esta) → copy lead → ContactForm (Inquiry type · First · Last · Phone · Secondary phone · Email · Confirm email · Address · State · City · Request details) → "Find an Office" acordeón por estado con tarjetas de oficina | CareTabs, ContactForm, OfficeAccordion | Media |
| 13 | careers | `/careers` | Estática | title "We build people too®" + collage derecho → "Join the team" (lista de beneficios 2 cols) junto a 2 TileCard (Future employees · Internships) → "Go further" CTA | InternalPageHero, CollageGrid, BenefitsList, TileCard | Baja |
| 14 | warranty | `/warranty` | Form multi-paso | CareTabs (Warranty seleccionado) → lead copy → form paso 1 "Let us know where you live" (zip + address autocomplete) → paso 2 "How can we contact you?" → upload de archivos (Dropzone) → captcha → submit | CareTabs, WarrantyForm (multi-paso), FileUploadPlaceholder | Alta |

> **Dinámica no capturada en el HTML:** las grillas de comunidades en state/area y los listados de available homes/plans en community vienen de Coveo/Sitecore. El HTML guardado trae el primer render (sin filtros ni paginación JS), suficiente para cablear el shape. El mapa de `globalmap` depende de Google Maps JS; se reemplaza por placeholder. El autocomplete de dirección en `warranty` depende de `warrantyentry.drhorton.com`; se reemplaza por mock. No hay capturas desktop/mobile para estas páginas (según prompt), así que la referencia es el HTML estático + CSS.

---

## 2 · Componentes compartidos nuevos

| Componente | Ubicación propuesta | Lo usan |
|---|---|---|
| `Breadcrumbs` | `src/components/ui/Breadcrumbs/` | state, area, community, contact, warranty |
| `InternalPageHero` | `src/components/ui/InternalPageHero/` | who-we-are, smart-home, services, customer-care, careers, military-benefits |
| `CollageGrid` | `src/components/ui/CollageGrid/` | who-we-are, services, careers, real-estate-agents |
| `ImageTextBlock` | `src/components/ui/ImageTextBlock/` | military-benefits, real-estate-agents, careers |
| `TileCard` | `src/components/ui/TileCard/` | who-we-are, services, customer-care, careers, military-benefits |
| `CardGrid` | `src/components/ui/CardGrid/` | who-we-are, services, customer-care, careers, military-benefits (contenedor de TileCard) |
| `ThreeColumnCards` | `src/components/ui/ThreeColumnCards/` | real-estate-agents (patrón alterno imagen/texto en 3 columnas) |
| `SliderCards` | `src/components/ui/SliderCards/` | smart-home (carousel con tarjeta imagen + texto). Ya existe `ImageSlider` para imágenes puras; este envuelve tarjetas |
| `CareTabs` | `src/components/ui/CareTabs/` | contact, warranty (header compartido de "Customer care") |
| `FormField` + `FormSelect` + `FormCheckboxGroup` | `src/components/ui/Form/` | contact, military-benefits, red-tag-event, warranty, RFI de ubicaciones |
| `FormLayout` | `src/components/ui/Form/FormLayout/` | wrapper con 2-col responsive + bloque de botones |
| `MapPlaceholder` | `src/components/ui/MapPlaceholder/` | state, area, globalmap, community (lot map) — contenedor con imagen estática o cluster SVG hasta que haya API |
| `Pagination` | `src/components/ui/Pagination/` | state, area |
| `LocationResultsHeader` | `src/features/locations/components/LocationResultsHeader/` | state, area (filter · sort · map toggle · RFI button) |
| `CommunityCard` | `src/features/locations/components/CommunityCard/` | state, area |
| `LocationBlurb` | `src/features/locations/components/LocationBlurb/` | state, area |
| `RFIForm` (+ `RFIModal`) | `src/features/locations/components/RFIForm/` | state, area, community |
| `PropertyGallery` | `src/features/locations/components/PropertyGallery/` | community |
| `CommunityHero` | `src/features/locations/components/CommunityHero/` | community (price · series · address · stats) |
| `CommunityAside` | `src/features/locations/components/CommunityAside/` | community (status · hours · tel · tour · text-with-us) |
| `PromoCard` | `src/features/locations/components/PromoCard/` | community (slot para RTE u otras promos) |
| `AmenitiesList` | `src/features/locations/components/AmenitiesList/` | community (expand/collapse) |
| `SchoolsList` | `src/features/locations/components/SchoolsList/` | community |
| `FloorPlanCard` | `src/features/locations/components/FloorPlanCard/` | community |
| `AvailableHomeCard` | `src/features/locations/components/AvailableHomeCard/` | community |
| `OfficeAccordion` | `src/features/contact/components/OfficeAccordion/` | contact |
| `GlobalMapPage` tiles | `src/features/globalmap/components/HomeTilesGrid/` | globalmap (muy similar a `FeatureGrid` del home → evaluar reutilización directa) |

### Tokens nuevos sugeridos (`src/styles/variables.css`)

Añadir solo lo que no esté en `variables.css` tras una lectura rápida al construir cada etapa:

- `--color-status-coming-soon: #01AF53;` (verde del `community-status-color` de state/area/community).
- `--color-status-now-selling`, `--color-status-move-in-ready` cuando se vean en screenshots de otras comunidades.
- `--color-blue-link-hover` si el actual `--color-link` necesita un `:hover` propio.
- Radio y sombra específicos para `TileCard` si difieren del `Card` base; de lo contrario reutilizar `--radius-card` y `--shadow-card`.

---

## 3 · Plantillas de ubicaciones — esquema de datos

Rutas (añadir una al `router.jsx`; las dos primeras ya existen):

```
/:state                                 → StatePage       ← ya cableada a LocationPage, falta template real
/:state/:area                           → AreaPage        ← ya cableada
/:state/:area/:city/:community          → CommunityPage   ← NUEVA
```

`statesIndex.js` hoy solo tiene `state → markets[]` (slug · name · aria). Lo expandimos a un árbol completo donde cada comunidad vive dentro de un mercado (área), opcionalmente agrupada por ciudad al nivel de URL.

### `StateEntry`

```js
{
  slug: "georgia",
  name: "Georgia",
  aria: "Georgia",
  blurb: "<p>From the majestic mountain peaks…</p>", // HTML/texto completo del area-blurb del state page
  resultsRadiusMiles: 275,                             // "within 275 miles of Georgia" en el H1
  totalResults: null,                                  // número total si se conoce, si no null
  markets: [AreaEntry, ...]
}
```

### `AreaEntry`

```js
{
  slug: "atlanta",
  name: "Atlanta",
  aria: "Atlanta",
  stateSlug: "georgia",
  heroTitle: "Find Your New Home in Atlanta, GA",
  blurb: "<p>Atlanta is an alluring destination…</p>",
  totalResults: null,
  cities: ["jefferson", "mcdonough", ...],             // orden para breadcrumb/sitemap, opcional
  communities: [CommunityEntry, ...]
}
```

### `CommunityEntry`

Todo valor numérico va como número; los rangos son objetos `{ min, max }`. Nunca inventar: lo que no esté en el HTML original se guarda como `null` y la UI muestra fallback ("Call for Information", "—", etc.).

```js
{
  slug: "jackson-landing",
  name: "Jackson Landing",
  stateSlug: "georgia",
  areaSlug: "atlanta",
  citySlug: "jefferson",
  cityName: "Jefferson",

  priceFrom: 392200,                 // number
  series: "Express Series®",
  address: "126 Bullock Pass",
  zip: "30549",
  phone: "770-373-4505",
  hours: [                           // modelado granular para que la UI lo renderice
    { days: "Mon - Sat", open: "10:00", close: "18:00" },
    { days: "Sun",       open: "12:00", close: "18:00" }
  ],

  status: "coming-soon" | "now-selling" | "move-in-ready" | null,
  tag: null,                         // badge opcional ("RTE", etc.)
  availableHomesCount: 11,           // null si no se conoce

  beds:    { min: 4, max: 5 },       // o null, o { min: 4, max: null } para "4+"
  baths:   { min: 2, max: 3 },
  garages: { min: 2, max: 3 },
  stories: { min: 1, max: 2 },
  sqftFrom: 1774,                    // valor "From X" del HTML

  gallery: [
    { src: "/assets/communities/jackson-landing/01.jpg", alt: "Hayden Exterior" },
    ...
  ],
  about: "<p>Welcome to Jackson Landing…</p>",
  amenities: ["Cabana", "HOA", "Park", "Pickleball", ...],
  schools: [
    { name: "Gum Springs Elementary", type: "Public", grades: "PK-5", distanceMi: 3.8 },
    { name: "West Jackson Middle",    type: "Public", grades: "6-8",  distanceMi: 3.9 },
    { name: "Jackson County High",    type: "Public", grades: "9-12", distanceMi: 1.4 }
  ],

  lotMapUrl: null,                   // placeholder a imagen/pdf cuando exista
  promoSlot: "red-tag-event" | null, // ID de promo a inyectar en PromoCard

  floorPlans: [
    { slug: "cali",   name: "Cali",   priceFrom: 392000, beds: 4, baths: 2,   garages: 2, stories: 1, sqft: 1774, image: "…" },
    { slug: "denton", name: "Denton", priceFrom: 421000, beds: 4, baths: 2.5, garages: 2, stories: 1, sqft: 2250, image: "…" },
    ...
  ],

  availableHomes: [
    {
      slug: "195-elsa-court",
      address: "195 Elsa Court",
      lot: null, price: 428900, beds: 4, baths: 2.5, garages: 2, stories: 2, sqft: 2338,
      image: "…",
      status: "move-in-ready",
      badge: "red-tag-event" | null
    },
    ...
  ],

  relatedMoveIns: []                 // nullable; cuando exista, mismo shape que availableHomes
}
```

### `School`, `FloorPlan`, `AvailableHome`

Ya definidos en línea arriba. Si crecen, moverlos a tipos propios en un futuro `src/features/locations/data/schema.md`.

### Integración con `statesIndex.js` y `LocationPage`

- **Fase A** — Mantener `statesIndex.js` actual (38 estados · 157 mercados sólo con slug/name/aria) para los enlaces del footer, y **crear en paralelo** un árbol enriquecido `src/features/locations/data/states/<state>.json` para los estados que se construyan (empezando por `georgia.json`).
- **Fase B** — El loader `getState(slug)` lee el JSON si existe, y hace fallback al `statesIndex.js` (`ComingSoon`) cuando no.
- **Comunidades** — `src/features/locations/data/communities/<state>/<community>.json` (una por archivo) para no abultar el estado. El JSON del área referencia por slug.
- **Router** — Añadir `path: ':state/:area/:city/:community'` a `router.jsx`. `LocationPage` pasa a decidir entre tres vistas según params presentes (StateView / AreaView / CommunityView), o se separa en tres páginas y el router elige directamente.
- **Breadcrumbs** — generarlos desde los params + lookup en el árbol; la ciudad es solo un segmento de URL (no tiene página propia por ahora, confirmar en Preguntas).

### Referencias externas revisadas

- `docs/reference/cloner-analysis.md` → **no existe** en este repo.
- `../cloner-referencia/docs/locations-schema.md` → sí existe y aporta un shape muy parecido. Diferencias con la propuesta de este plan:
  - Usa `beds`/`baths`/`sqft` como **strings** (`"4–5"`); aquí lo cambiamos a **números/rangos** porque el prompt lo exige.
  - Define `tag: "Move-in Ready" | "Now Selling" | "Coming Soon"`; aquí separamos `status` (badge principal, en kebab-case) de `tag` (badge secundario tipo "RTE") para dejar más libertad.
  - No modela `hours`, `stories`, `promoSlot`, `relatedMoveIns`, `lotMapUrl` ni `galleries`; aquí sí porque la comunidad real los muestra.
  - URL completa (`url: "/georgia/atlanta/jefferson/jackson-landing"`) → aquí es derivada (`\`/${stateSlug}/${areaSlug}/${citySlug}/${slug}\``) para no duplicar fuente de verdad.

---

## 4 · Orden recomendado por etapas

Cada etapa debe caber holgada en una sesión del plan Pro. Preferimos **etapa 1 chica** (los bloques base) para desatascar las estáticas y dejar la plantilla de ubicaciones (grande) para el final.

### Etapa 1 · UI compartido base — **pequeña**
- `Breadcrumbs`, `InternalPageHero`, `TileCard`, `CardGrid`, `CollageGrid`, `ImageTextBlock`.
- Añadir el token `--color-status-coming-soon` y revisar que todos los tiles respeten `--radius-card`/`--shadow-card`.

### Etapa 2 · Páginas estáticas simples — **pequeña**
Páginas que solo usan los componentes de Etapa 1 (sin forms, sin dinámico):
- `services` (`/services`)
- `customer-care` (`/customer-care`)
- `careers` (`/careers`)
- `who-we-are` (`/who-we-are`)

Entregable: 4 features bajo `src/features/<nombre>/` con `data/` propia (textos, imágenes, lista de beneficios), reemplazando los `ComingSoon` del router.

### Etapa 3 · Estáticas con bloque extra — **COMPLETADA** ✓
- `smart-home` → `SliderCards` (6 dispositivos + 3 benefits tiles). Commit `etapa 3: smart-home`.
- `real-estate-agents` → `HalfVideoHero` (facade Vimeo ID 869339532), `ThreeColumnCards`, `CollageGrid` 3×2. Commit `etapa 3: real-estate-agents`.
- `red-tag-event` → `RedTagHero` + `RedTagForm` (validación client-side, aria-invalid/describedby, thank-you al submit). Commit `etapa 3: red-tag-event`.
- `who-we-are` → slider My Story convertido de grid estático a `SliderCards`. Commit `etapa 3: who-we-are slider`.
- **Adelanto de Etapa 4**: `FormField`, `FormSelect`, `FormCheckboxGroup`, `FormLayout` (src/components/ui/Form/) y `useForm` hook (src/hooks/) creados e incluidos en el commit `etapa 3: red-tag-event`. La Etapa 4 los reutiliza directamente.

### Etapa 4 · Military benefits — **COMPLETADA** ✓
- ~~`FormField`, `FormSelect`, `FormCheckboxGroup`, `FormLayout` en `src/components/ui/Form/`.~~ *(ya creados en Etapa 3)*
- ~~Hook `useForm` o similar en `src/hooks/`.~~ *(ya creado en Etapa 3)*
- `military-benefits`: lead `ImageTextBlock` (imagen derecha, flag icon, h1, CTA → #contact-form) + 3 `TileCard` de beneficios + testimonial `ImageTextBlock` (Ocampo Family) + VA loans `ImageTextBlock` (logo DHI Mortgage, CTA externo) + `MilitaryBenefitsForm` (First/Last/Email/Phone + Military branch + Current status + Installation condicional por rama). Commit `etapa 4: military-benefits`.
- **Nota City field**: el select "City" en `RedTagForm` queda deshabilitado con placeholder "Available in a future update"; se completará en Etapa 5 junto con los datos de ubicaciones.

### Etapa 5 · Esquema de ubicaciones + State/Area — **grande** (dividible en 5a y 5b)
- 5a: **COMPLETADA** ✓ `georgia.json` (20 comunidades: 17 en atlanta, 3 en macon-area) + loader con fallback a statesIndex + `StatePage`/`AreaPage` con breadcrumbs, filtros, paginación client-side, RFI modal y blurb. Ruta `/:state/:area/:city/:community` → CommunityComingSoon. City select del RedTagForm rellenado desde JSON.  
  _Scripts_: `extract-location.js` para regenerar JSONs desde HTML de referencia.
- 5b: `MapPlaceholder` (SVG o imagen estática por área) con marker list simple. Dejar enganche para una futura integración de Google Maps.

### Etapa 6 · Community page — **grande**
- Agregar ruta `/:state/:area/:city/:community` en el router.
- Datos reales de `jackson-landing`.
- Componentes: `PropertyGallery`, `CommunityHero`, `CommunityAside`, `AmenitiesList`, `SchoolsList`, `LotMapBanner`, `FloorPlanCard`, `AvailableHomeCard`, `PromoCard`.
- Enganchar el `RFIForm` del paso 5a y el botón "Request a tour" (abre el mismo modal con contexto de comunidad).

### Etapa 7 · Customer care family — **mediana**
- `CareTabs` compartido.
- `contact` (`/contact-us-page`): `ContactForm` + `OfficeAccordion`. Los datos de oficinas los extraemos del HTML de contact.html (hay accordions por estado con `h5` de ciudad + `<p>` con dirección/teléfono).
- `warranty` (`/warranty`): form multi-paso + `FileUploadPlaceholder` (dropzone fake sin backend). Captcha simulado (checkbox "I'm not a robot" visual, sin verificación real).

### Etapa 8 · Globalmap — **mediana**
- `/globalmap`.
- `GlobalMapPlaceholder` (imagen estática del mapa con pins SVG derivados de `statesIndex.js`; opcionalmente integrar `@react-google-maps/api` con la API key del usuario — ver Preguntas).
- `HomeTilesGrid` reutilizando patrón `FeatureGrid` del home.
- Reemplazar video de Vimeo por poster + enlace "Watch" (sin autoplay).

---

## 5 · Resumen

- Las 14 referencias están normalizadas (`<carpeta>.html` + `<carpeta>-files/`) con rutas internas actualizadas.
- Hay ~15 componentes UI nuevos reutilizables (hero interno, tiles, collage, image-text, carousel de tarjetas, breadcrumbs, formularios, mapa placeholder…) y otros ~10 específicos de ubicaciones.
- La plantilla de ubicaciones es la pieza más grande: queda al final (etapas 5–6) con un esquema de datos basado en números/rangos y `null` para huecos reales.
- Entre páginas con `main.min.css` idéntico y la mayoría del contenido en HTML plano, el **90% del trabajo es componentes + data**; muy poco scraping extra.

## 6 · Preguntas abiertas / decisiones pendientes

1. **Comunidades reales**: ¿poblamos `jackson-landing.json` + alguna comunidad más a mano desde el HTML de referencia, o escribimos un pequeño script de extracción similar a `extract-states.js`? Mi recomendación: a mano para Jackson Landing (etapa 6) y evaluamos script si entran más de 3–4 comunidades.
2. **Google Maps**: ¿tienes API key propia que podamos usar en `/globalmap`, `/:state`, `/:state/:area` y lot-map de community? Si no, lo dejamos como `MapPlaceholder` con imagen estática + lista de markers (sin interactividad real).
3. **Videos de Vimeo** (real-estate-agents, globalmap): ¿sustituimos por un poster estático + icono play (sin fuente), subimos un `.mp4` propio, o integramos vía `<video>` apuntando a un alojamiento tuyo?
4. **Formularios**: ¿todos los submits son mock (toast "Thanks!"), o querés integrar un servicio tipo Formspree/EmailJS/API propia? Afecta a RFI, contact, warranty, military, red-tag.
5. **Modal legal (iframe a HTML externo)**: en todas las páginas aparece `#legal-modal`. ¿Lo mantenemos como `LegalModal` que abre contenido local en `/legal` (ya existe `src/components/ui/LegalModal/`), o lo omitimos de estas páginas?
6. **Ciudad como nivel de URL**: el community page vive en `/:state/:area/:city/:community`, pero no hay página de ciudad. ¿Confirmas que la ciudad es solo un segmento de URL / breadcrumb intermedio sin página propia?
7. **CustomerCare landing**: `/customer-care` muestra 4 tiles como entrada; de ellos solo `/warranty` y `/contact-us-page` tienen HTML aquí. ¿Las otras dos entradas (`/documents-and-guides` y `/contact-us---property-submittals`) quedan como `ComingSoon`?
8. **"Text With Us"**: botón en community page y RTE. ¿Abrimos modal con un número `sms:` (iOS/Android), o un formulario de texto?
9. **Captcha de warranty**: ¿aceptamos no implementar captcha real (sólo visual) o integramos reCAPTCHA/hCaptcha?
10. **Logo Red Tag Event**: `red-tag-event-files/L1_Red-Tag-Event_Logo_Red.svg` ya está en la referencia. ¿Lo copiamos tal cual a `src/assets/brand/` o pedimos una versión alternativa a `docs/mockups/brand/`?
11. **`globalmap` como ruta vs `/map` o `/map-view`**: hoy el FIXED_ROUTE lo llama `globalmap` por consistencia con la URL original. ¿Mantener o renombrar?

---

## 7 · Decisiones tomadas

Respuestas del equipo a las preguntas de la sección 6. Cuando aquí digamos algo distinto a la propuesta original, manda esto.

1. **Comunidades**: a mano para Jackson Landing. Script solo si entran más de 3–4 comunidades. Las imágenes vienen de `community-jackson-landing-files/` convertidas con `npm run images`; nunca referenciamos URLs de `drhorton.com` desde la app.
2. **Mapas**: Leaflet + `react-leaflet` con tiles de OpenStreetMap (sin API key). Si una entidad no tiene coordenadas, se renderiza `MapPlaceholder` (imagen o pin estático). Esta decisión reemplaza la mención a Google Maps en el plan.
3. **Videos** (real-estate-agents, globalmap): patrón "facade" — un `<picture>`/poster con botón play visible; el `<iframe>` de Vimeo (con `?dnt=1`) solo se inyecta tras el click del usuario. Sin autoplay y sin cookies hasta ese momento.
4. **Formularios**: todos simulados. Validación client-side + mensaje de agradecimiento al enviar. No se persisten ni se envían datos a ningún endpoint.
5. **Modal legal**: ya vive en el `Footer` compartido; no agregamos nada por página.
6. **Ciudad en la URL**: solo segmento + breadcrumb intermedio. No tiene página propia.
7. **Customer care — tiles restantes**: `/documents-and-guides` y `/contact-us---property-submittals` quedan como `ComingSoon`.
8. **"Text With Us"**: abre un aviso tipo "no disponible en esta versión". No usamos `sms:` con el número real del community.
9. **Captcha de warranty**: se omite por completo. Dejar la razón anotada en `NOTES.md` cuando se construya la página (etapa 7).
10. **Logo Red Tag Event**: copiar `red-tag-event-files/L1_Red-Tag-Event_Logo_Red.svg` a `src/assets/brand/` cuando se arme la página (etapa 3).
11. **Ruta `/globalmap`**: se mantiene tal cual.
12. **Datos completos de los 38 estados y 157 áreas**: se decide después de las etapas 5 y 6 (plantillas listas con un estado real primero). En este punto `statesIndex.js` sigue sirviendo solo al footer.

### Nota — ruta `/dev/components`

Como parte de la etapa 1 se crea `/dev/components`, una página temporal que renderiza cada componente nuevo con datos de ejemplo tomados de las referencias (services, who-we-are, military-benefits). **Esta ruta se elimina al final del proyecto** junto con su feature.
