# D.R. Horton — Sitio de práctica

Réplica de práctica del sitio web de D.R. Horton construida con React 19 + Vite.
**No está afiliada ni patrocinada por D.R. Horton, Inc.**

---

## Stack

- React 19 + React Compiler
- Vite 6
- React Router DOM v7
- CSS Modules (mobile-first)
- Leaflet + OpenStreetMap (mapa sin API key)

---

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build local de `dist/` |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run images` | Optimiza imágenes en `src/assets/` con sharp |
| `npm run screenshots` | Toma capturas de pantalla de todas las rutas (requiere servidor activo) |

---

## Rutas implementadas

| Ruta | Página |
|---|---|
| `/` | Home |
| `/who-we-are` | Who We Are |
| `/smart-home` | Smart Home |
| `/services` | Services |
| `/customer-care` | Customer Care |
| `/careers` | Careers |
| `/real-estate-agents` | Real Estate Agents |
| `/red-tag-event` | Red Tag Event |
| `/military-benefits` | Military Benefits |
| `/contact-us-page` | Contact Us |
| `/warranty` | Warranty Request (formulario 3 pasos) |
| `/globalmap` | Global Map (Leaflet + OpenStreetMap) |
| `/georgia` | State page (Georgia) |
| `/georgia/atlanta` | Area page (Atlanta) |
| `/georgia/atlanta/:city/:community` | Community page (ej. Jackson Landing) |

Rutas marcadas como `ComingSoon`: `/epa-consent-decree`, `/rentals/rentalinvestor`, `/documents-and-guides`, `/contact-us---property-submittals`.

---

## Estructura de carpetas

```
src/
├── app/
│   └── router/         # Definición de rutas
├── assets/             # Imágenes, SVG, iconos
├── components/
│   ├── layout/         # Header, Footer, MainLayout
│   └── ui/             # Componentes reutilizables (TileCard, CardGrid…)
├── features/           # Un directorio por página/feature
│   ├── home/
│   ├── who-we-are/
│   ├── smart-home/
│   ├── services/
│   ├── customer-care/
│   ├── careers/
│   ├── real-estate-agents/
│   ├── red-tag-event/
│   ├── military-benefits/
│   ├── contact/
│   ├── warranty/
│   ├── globalmap/
│   ├── locations/      # StatePage, AreaPage, CommunityPage
│   └── common/         # ComingSoon, NotFound
├── hooks/              # Hooks reutilizables
├── services/           # Servicios compartidos
├── styles/             # Variables CSS globales
└── utils/              # Funciones utilitarias
docs/
├── mockups/            # Mockups de referencia por módulo
└── reference/          # HTML de referencia original + MODULES-PLAN.md
scripts/                # Utilidades: imágenes, coords, screenshots
```

---

## Notas

- Los formularios son simulados (validación client-side + mensaje de agradecimiento).
  No envían datos a ningún endpoint.
- El mapa usa Leaflet + OpenStreetMap sin API key.
- Los videos de Vimeo usan el patrón "facade" (poster + iframe se carga solo al clic).
- Solo Georgia tiene datos reales; los demás estados muestran `ComingSoon`.
