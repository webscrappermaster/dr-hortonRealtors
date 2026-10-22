# Notas de reconocimiento — DR Horton scraper

Reconocimiento ejecutado el 2026-10-22.  
Piloto: **Georgia → Atlanta** / comunidad **Jackson Landing** / QMI `195-elsa-court`.

---

## Arquitectura de datos del sitio

El sitio usa **Sitecore** como CMS. Las páginas de área devuelven un JSON propio; las páginas de comunidad y QMI están **renderizadas en el servidor (SSR)** sin API separada.

> **Coveo no sirve datos aquí.** El HTML lleva clase `CoveoResultLink` en las tarjetas, pero los resultados vienen pre-renderizados por Sitecore — no hay llamada a la API de Coveo que capturar.

---

## Flujo estado → área → comunidad → casas

```
statesIndex.js
    └─ GET /api/comms/direct/{state}/{area}          ← JSON
            └─ CommunityData[].commPageLink           ← ruta HTML
                    └─ GET /{state}/{area}/{city}/{community}  ← HTML (SSR)
                            └─ .available-home-card           ← tarjetas de casas
                                    └─ card[href]  →  GET /{.../qmis/{address-slug}}  ← HTML (opcional)
```

---

## Endpoint 1 — Comunidades de un área

```
GET https://www.drhorton.com/api/comms/direct/{state-slug}/{area-slug}
```

**Ejemplo:** `/api/comms/direct/georgia/atlanta`

**Respuesta** (status 200, `application/json`):

```json
{
  "MetaData": {
    "AreaInfoData": {
      "Name": "Atlanta",
      "Latitude": 33.77119,
      "Longitude": -84.39054,
      "Radius": 100,
      "ZoomLevel": 9,
      "Title": "Find Your New Home in Atlanta, GA",
      "AreaInfoContent": "..."
    }
  },
  "FacetData": {
    "PriceFacet": { "min": 248005, "max": 747990 },
    "BedsFacet":  { "min": 2, "max": 5 },
    ...
  },
  "CommunityData": [ ... ]
}
```

**Campos de cada comunidad en `CommunityData`:**

| Campo | Tipo | Descripción |
|---|---|---|
| `commName` | string | Nombre de la comunidad |
| `commPageLink` | string | Ruta relativa: `/{state}/{area}/{city}/{community}` |
| `commAvailableHomes` | number\|null | Cantidad de casas disponibles (null → 0) |
| `commCoordsLat` / `commCoordsLng` | number | Coordenadas de la comunidad |
| `commMinPrice` / `commMaxPrice` | number | Rango de precios |
| `commMinBeds` / `commMaxBeds` | number | Rango de habitaciones |
| `commMinBaths` / `commMaxBaths` | number | Rango de baños (0.5 = medio baño) |
| `commMinCars` / `commMaxCars` | number | Rango de garajes |
| `commMinStories` / `commMaxStories` | number | Rango de pisos |
| `commMinSqft` / `commMaxSqft` | number | Rango de sq ft |
| `commSellingStatus` | string | "Now Selling" \| "Coming Soon" |
| `commPropertyType` | string | "Townhome" \| "Single Family" \| … |
| `commBrand` | string | Serie ("Express Series℠", "Tradition Series℠", …) |
| `commAddress` | string | "City, ST ZIP" (sin calle) |
| `commBadgeList` | string\|null | Promo badges, p. ej. `"red-tag-event=4"` |

**Paginación:** No existe. Una sola llamada devuelve todas las comunidades del área (Atlanta devolvió 88).

---

## Endpoint 2 — Casas disponibles de una comunidad (HTML SSR)

```
GET https://www.drhorton.com{commPageLink}
```

**Ejemplo:** `/georgia/atlanta/jefferson/jackson-landing`

**Fuente de datos:** HTML del servidor. Todas las tarjetas están en el DOM al `DOMContentLoaded` — no requiere esperar JavaScript adicional.

**Selector:** `.available-home-card` (también tiene clase `CoveoResultLink`)

**Datos por tarjeta:**

| Campo | Origen en el DOM |
|---|---|
| `href` | `card.getAttribute('href')` — patrón `/{state}/{area}/{city}/{community}/qmis/{address-slug}` |
| precio | Texto de `<h2>`, primer número con `$` |
| precio original | `<del>` dentro del card — existe solo si hay descuento |
| dirección (calle) | Texto después del bloque de precios |
| beds | Texto con patrón `/(\d+)\s+Bed/` |
| baths total | Texto con patrón `/([\d.]+)\s+Bath/` — `.5` = medio baño |
| garage | Texto con patrón `/(\d+)\s+Garage/` |
| stories | Texto con patrón `/(\d+)\s+Stor/` |
| sqft | Texto con patrón `/([\d,]+)\s+Sq\.\s*Ft\./` |
| lot | Texto con patrón `/Lot\s+(\d+)/` |
| status | `href` presente → `available`; texto "Under Contract" → `under-contract` |

**Casas "Under Contract"** también aparecen en la lista pero sin `href`.

**Paginación:** Ninguna. Botón "+ Show all homes for sale" es cosmético (toggle UI, no carga más datos). Todos los cards están en el HTML inicial.

**Conteo vs. `commAvailableHomes`:** Puede diferir 1–2 unidades por latencia entre el caché del API y el CMS (datos cambian a diario).

---

## Endpoint 3 — QMI individual (HTML SSR + JSON-LD)

```
GET https://www.drhorton.com/{state}/{area}/{city}/{community}/qmis/{address-slug}
```

**Ejemplo:** `/georgia/atlanta/jefferson/jackson-landing/qmis/195-elsa-court`

**Datos útiles:**

1. **JSON-LD** (`<script type="application/ld+json">` con `@type: "House"`):

```json
{
  "@type": "House",
  "numberOfBedrooms": 4,
  "floorSize": 2338,
  "numberOfBathroomsTotal": 2,
  "address": {
    "streetaddress": "195 ELSA COURT",
    "addresslocality": "JEFFERSON",
    "addressregion": "GA",
    "postalcode": "30549"
  },
  "latitude": 34.10082,
  "longitude": -83.62191
}
```

> Las coordenadas son de nivel **comunidad** (no del lote exacto).

2. **Plan name** en texto de página: "Galen floor plan"
3. **Series** en texto: "Express Series®"
4. **Estimated completion** no aparece en las casas "available now" (aparece en under-construction).

**`/api/qmis/direct/{state}/{area}/{city}/{community}`** también se llama desde la página QMI pero devuelve `HomeData: []` — no es útil.

---

## Resumen de estrategia para el crawler (Parte 2)

1. Para cada estado/área de `statesIndex.js`:  
   → `GET /api/comms/direct/{state}/{area}` — obtiene todas las comunidades.

2. Para cada comunidad con `commAvailableHomes > 0`:  
   → `GET /{state}/{area}/{city}/{city-slug}/{community}` — parsea `.available-home-card`.
   - URL se construye desde `commPageLink`.

3. **(Opcional) Coordenadas exactas:** visitar cada QMI individual para leer el JSON-LD.  
   Alternativa: usar coordenadas de comunidad con `locationPrecision: "city"`.

4. **Sin API de Coveo, sin proxies, sin captchas** — todo es HTML público y una API REST propia del sitio.

---

## Advertencias

- `networkidle` nunca se resuelve en páginas de comunidad (Vimeo, chat widget, Google Ads generan tráfico infinito). Usar `domcontentloaded` + espera fija (~5 s).
- Las páginas QMI individuales también bloquean `networkidle`. Mismo patrón.
- Precios y disponibilidad cambian a diario — registrar `scrapedAt`.
- Si el sitio devuelve 403/429, respetar y detener (ver reglas del prompt).
