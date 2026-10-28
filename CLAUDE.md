# D.R. Horton — Reglas del proyecto

## Stack
- React 19 + Vite + JavaScript
- React Compiler (no usar `useMemo`/`useCallback` manualmente)
- React Router DOM v7
- CSS Modules para estilos por componente

---

## Arquitectura por features

Cada módulo nuevo vive en `src/features/<nombre>/` con la siguiente estructura interna:

```
features/<nombre>/
├── components/       # Componentes exclusivos del módulo
│   └── MiComponente/
│       ├── MiComponente.jsx
│       ├── MiComponente.module.css
│       └── index.js
├── data/             # Contenido estático (textos, links, listas)
├── hooks/            # Hooks específicos del módulo (opcional)
├── services/         # Llamadas a API del módulo (opcional)
└── NombrePage.jsx    # Página principal del módulo
```

Lo que se comparte entre dos o más módulos sube a:
- `src/components/` — componentes reutilizables (layout y ui)
- `src/hooks/` — hooks reutilizables
- `src/services/` — servicios compartidos
- `src/utils/` — funciones utilitarias puras

---

## Reglas de componentes

- Cada componente en su propia carpeta: `Componente.jsx` + `Componente.module.css` + `index.js`.
- Nombres en **PascalCase**.
- El `index.js` solo re-exporta: `export { default } from './Componente'`.
- No crear componentes de un solo uso dentro de otro archivo; siempre carpeta propia.

---

## Estilos

- **CSS Modules** exclusivamente para estilos por componente.
- Colores, tipografía, espaciados y radios **solo desde variables CSS** definidas en `src/styles/variables.css`. Nunca valores sueltos (ej: `color: #c8102e` está prohibido; usar `color: var(--color-primary)`).
- Diseño **responsive mobile-first**: escribir los estilos base para móvil y agregar `@media (min-width: ...)` para pantallas mayores.
- Breakpoints de referencia: mobile `< 640px`, tablet `640px–1023px`, desktop `≥ 1024px`, wide `≥ 1280px`.

---

## Contenido estático

- Textos, links, listas y cualquier dato fijo van en archivos `data/` del módulo correspondiente.
- Los componentes recorren esos datos con `.map()`, nunca hardcodean contenido en JSX.

---

## React Compiler

- **No usar** `useMemo`, `useCallback` ni `React.memo` manualmente.
- El compilador optimiza automáticamente. Agregar memoización manual puede interferir.

---

## Accesibilidad

- HTML semántico: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`, etc.
- Atributo `alt` descriptivo en todas las imágenes; `alt=""` solo para imágenes decorativas.
- `aria-label` en botones que solo contienen un ícono (sin texto visible).
- Asegurar contraste de color suficiente (mínimo WCAG AA).

---

## Comentarios

- Comentarios **en español**.
- Solo cuando el **por qué** no es obvio: una restricción oculta, un workaround, comportamiento sorpresivo.
- No comentar qué hace el código; los nombres descriptivos ya lo explican.
- No docstrings multi-línea.

---

## Router

- Rutas definidas en `src/app/router/router.jsx`.
- Cada feature expone su página principal y el router la importa directamente.
- Usar `<Link>` de react-router-dom, nunca `<a>` para navegación interna.

---

## Mockups

- Los mockups de cada módulo están en `docs/mockups/<modulo>/`.
- Antes de construir cualquier componente, consulta el mockup correspondiente.
- Los archivos siguen el patrón `NN-nombre.webp` (ej: `01-hero.webp`).
- La identidad de marca de referencia (logo, redtag) está en `docs/mockups/brand/`.

---

## Convenciones de nombrado

| Elemento | Convención |
|---|---|
| Componentes | PascalCase |
| Archivos de componente | PascalCase.jsx |
| CSS Modules | PascalCase.module.css |
| Hooks | camelCase con prefijo `use` |
| Utilidades | camelCase |
| Archivos de data | camelCase (ej: `navLinks.js`) |
| Variables CSS | kebab-case con prefijo semántico |

---

## Imágenes de comunidades scrapeadas (excepción temporal)

Las comunidades scrapeadas usan `cardImageRemoteUrl` — una URL remota de `drhorton.com`
almacenada en el JSON del estado. Esto es una excepción temporal a la regla de imágenes locales:

- **Solo uso local** (desarrollo / preproducción). No publicar con URLs remotas de un dominio
  ajeno en producción.
- **Pendiente**: descargar las imágenes y reemplazar `cardImageRemoteUrl` por `cardImage`
  (nombre de archivo local) antes de cualquier despliegue público.
- La función `getCommunityImage(community)` en `locationLoader.js` abstrae la resolución:
  primero usa `cardImageUrl` (imagen local curada), luego `cardImageRemoteUrl` (remota).
  Cambiar a locales solo requiere poblar `cardImage` en el JSON y no tocar los componentes.

---

## Pipeline de scraping

Los datos de comunidades y casas disponibles se generan con cuatro scripts en `scripts/scrape/`.  
Los datos crudos (`docs/reference/scraping/raw/`) **no van al repositorio** (están en `.gitignore`).

### Flujo completo

```
crawl.js          →  raw/<state>/<area>/<community>.json   (datos crudos)
check-counts.js   →  consola                               (verificación antes de normalizar)
normalize.js      →  homes-normalized.json                 (diagnóstico/reporte)
merge.js          →  src/features/locations/data/states/   (JSONs de la app)
report.js         →  docs/reference/scraping/REPORT.md     (tabla por comunidad)
```

### Ritmo seguro de crawl

- Delay entre peticiones: **12–20 s** aleatorio
- Pausa larga: **5 min** cada **25 páginas**
- Cabeceras: `User-Agent` de navegador real, `Accept-Language: en-US`

### Si el servidor devuelve 429 (Too Many Requests)

1. Detener el crawl inmediatamente (`Ctrl+C`).
2. Esperar el tiempo indicado en el header `Retry-After` (o 10 min si no viene).
3. Reanudar desde el estado guardado: `node crawl.js --resume`.

### Actualizar datos en el futuro

```bash
# 1. Crawl de todos los estados (puede tardar horas — usar --states=texas para uno solo)
node scripts/scrape/crawl.js

# 2. Verificar conteos antes de normalizar
node scripts/scrape/check-counts.js

# 3. Normalizar → diagnóstico
node scripts/scrape/normalize.js

# 4. Integrar en JSONs de la app (preserva datos curados en communities/)
node scripts/scrape/merge.js

# 5. Generar reporte
node scripts/scrape/report.js
```

### Valores de `status` en casas

| Valor | Significado | Origen |
|---|---|---|
| `move-in-ready` | Casa disponible con enlace qmis | Derivado de `available` del crawl |
| `under-contract` | Casa reservada, sin enlace público | Directo del HTML |

Nunca usar `available` como status en componentes o JSONs de la app — solo existe en el JSON crudo del crawl.

---

## Contacto por WhatsApp

- **Número dinámico**: viene de `/api/settings` (Edge Config en Vercel). El hook `useSiteSettings()` lo expone a todos los componentes. `VITE_WHATSAPP_NUMBER` en `.env` es solo respaldo para desarrollo local (`npm run dev` sin API).
- **Solo el número propio del proyecto**. Nunca hardcodear números de D.R. Horton ni de terceros.
- **Sin scripts de terceros**: solo enlaces `https://wa.me/<número>?text=<mensaje>` con `target="_blank"` y `rel="noopener noreferrer"`.
- **Sin número configurado**: los botones siguen visibles pero muestran un aviso accesible en lugar de abrir wa.me.
- **Excepción a la regla "sin tel/mailto"**: se permiten enlaces WhatsApp (`wa.me`) exclusivamente con el número del proyecto.
- `.env` está en `.gitignore`. El repositorio incluye `.env.example` con la plantilla.
- Plantillas de mensajes en `src/config/whatsappMessages.js`; lógica de construcción en `src/utils/whatsapp.js`.

### Edge Config — configuración en Vercel

Lecciones aprendidas al poner en producción el store de ajustes:

- **Tipo de store:** los stores con prefijo `ecfg_` son **Edge Config**. La ruta REST de escritura es `/v1/edge-config/{id}/items` (no `/v1/global-config/`).
- **Token:** debe crearse con scope **webscrapermaster → All Projects**. Un token limitado a un proyecto específico no puede acceder al store y devuelve 403/404.
- **`VERCEL_TEAM_ID`:** obligatorio en cuentas de equipo. Sin él, la API REST rechaza las escrituras.
- **Redeploy:** cualquier cambio en variables de entorno de Vercel requiere un Redeploy manual para que las funciones serverless tomen los nuevos valores.
- Guía no técnica paso a paso en `docs/guia-administradora.md`.

### RFIModal y "Request a tour"

- **No son simulados**: al pulsar "Send request", validan el formulario y abren WhatsApp con nombre, apellido, email, teléfono (opcional), nombre de comunidad y URL de la página.
- **Sin almacenamiento**: los datos del formulario no se guardan en ningún lugar (ni API, ni consola).
- El aviso "When you send this request, WhatsApp will open…" aparece siempre debajo del botón de envío para que el cliente sepa lo que ocurrirá.
- Sin número configurado: el formulario valida y muestra el agradecimiento, pero no abre WhatsApp; el aviso lo indica antes de enviar.
