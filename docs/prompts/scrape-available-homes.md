# Prompt: extraer viviendas disponibles (todos los estados y comunidades)

Lee CLAUDE.md antes de empezar. Trabaja por partes, **commit por parte**, `npm run lint` y `npm run build` al cerrar cada parte. Si el cupo se acaba, termina la parte en curso, haz commit y detente.

## Objetivo
Obtener las **viviendas disponibles (available / quick move-in homes)** de drhorton.com para los 38 estados y 157 mercados de `statesIndex.js`, con su comunidad, y guardarlas en el modelo de datos existente (StateEntry → AreaEntry → CommunityEntry → availableHomes).

## Reglas obligatorias
- Proyecto de práctica, no afiliado. Uso solo local; los datos crudos NO se suben a git.
- **No eludir protecciones:** si aparece un reto de Cloudflare, CAPTCHA, 403 o 429, detén el script, guarda el progreso y reporta. Nada de proxies rotativos, stealth plugins, falsificar user-agent ni resolver captchas.
- Ritmo humano: 1 página a la vez, espera aleatoria de 4–8 s entre páginas, pausa de 60 s cada 50 páginas. Máximo 1 reintento por página.
- User-agent honesto de Playwright (el de Chromium por defecto).
- Nunca inventar datos: lo que no aparezca → `null`.
- **No descargar imágenes** en esta etapa (regla del proyecto: imágenes locales y optimizadas; eso se decide después).
- No copiar `<script>` ni código de terceros del sitio.

## Parte 1 — Reconocimiento (solo Georgia → Atlanta)
El listado lo carga Coveo con JavaScript; el HTML del servidor no trae las casas.
1. Crea `scripts/scrape/recon.js` con Playwright (Chromium, headless) que abra la página de área de Atlanta y la de una comunidad con casas disponibles (p. ej. Jackson Landing).
2. **No llames a la API de Coveo directamente.** Escucha las respuestas de red que la propia página hace (`page.on('response')`) y guarda los JSON en `docs/reference/scraping/raw/recon/`.
3. Documenta en `docs/reference/scraping/NOTES.md`: qué respuestas traen comunidades y casas, nombres de campos, cómo se pagina (scroll, botón "load more", parámetros), y cómo se navega estado → área → comunidad.
4. Agrega `docs/reference/scraping/raw/` a `.gitignore`. Commit.

## Parte 2 — Extractor + normalizador (piloto Atlanta)
1. `scripts/scrape/crawl.js`:
   - Recorre `statesIndex.js` (opción `--states=georgia,texas` y `--limit=N`).
   - Por cada área: abre la página, captura las respuestas de red, recorre la paginación.
   - Por cada comunidad con casas disponibles: abre su página y captura las casas.
   - Guarda cada respuesta cruda en `raw/<state>/<area>/<community>.json` (caché: si existe, no se vuelve a pedir salvo `--refresh`).
   - Progreso reanudable en `raw/progress.json` (estado de cada URL: pending/done/blocked/error).
   - Log en `raw/crawl.log` con URL, estado HTTP y tiempo.
2. `scripts/scrape/normalize.js`: convierte lo crudo al esquema de abajo, sin peticiones de red.
3. Corre el piloto solo con Atlanta, muéstrame 3 casas normalizadas y el conteo. Commit.

### Esquema de cada casa disponible
```json
{
  "id": "string (id del sitio o slug de la dirección)",
  "address": { "street": null, "city": null, "state": null, "zip": null },
  "communitySlug": "string",
  "areaSlug": "string",
  "stateSlug": "string",
  "planName": null,
  "price": null,
  "originalPrice": null,
  "beds": null,
  "baths": { "full": null, "half": null },
  "sqft": null,
  "garage": null,
  "stories": null,
  "status": "move-in-ready | under-construction | null",
  "estimatedCompletion": null,
  "lotNumber": null,
  "location": { "lat": null, "lng": null },
  "locationPrecision": "exact | city",
  "sourceUrl": "string",
  "scrapedAt": "ISO 8601"
}
```
Números como números (sin "$" ni comas); rangos como `{min,max}`.

## Parte 3 — Integración con el modelo existente
1. `scripts/scrape/merge.js`: escribe/actualiza `src/features/locations/data/states/<state>.json`.
   - **No sobrescribir** datos curados a mano (Georgia, Jackson Landing con galería, planos, schools, etc.): solo añadir/actualizar `availableHomes` y campos que hoy estén en `null`.
   - Si una casa no trae coordenadas, usar las de la comunidad o `scripts/add-coords.js` (`locationPrecision: "city"`).
2. Verifica que StatePage, AreaPage y CommunityPage cargan bien con los datos nuevos (sin imágenes → placeholder). Lint + build. Commit.

## Parte 4 — Ejecución completa
1. Corre `crawl.js` estado por estado (no todos de golpe), luego `normalize.js` y `merge.js`.
2. Si aparece un bloqueo, detente y reporta en qué estado quedó; se reanuda después con `progress.json`.
3. Genera `docs/reference/scraping/REPORT.md`: casas por estado/área/comunidad, URLs fallidas o bloqueadas, campos con más `null`, fecha de extracción.
4. Lint + build. Commit.

## Al terminar
Resume: totales por estado, qué quedó pendiente o bloqueado, y recuerda que los datos caducan (precios/estado cambian a diario) y llevan fecha `scrapedAt`.
