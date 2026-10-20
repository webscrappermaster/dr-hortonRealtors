# Prompt: Recrear la Home idéntica al original

Objetivo: recrear la Home de D.R. Horton IDÉNTICA al original, en React, siguiendo CLAUDE.md.

Referencia principal: docs/reference/original-home/ (página original guardada: HTML + carpeta _files con main.min.css, home.css, SVG e imágenes). Referencias secundarias: docs/mockups/home/ y docs/mockups/brand/.

## Antes de empezar

- Ya existe una base construida (commit "Base del proyecto: layout, header, promobar, slider"). Revisa primero lo que hay en src/.
- REUTILIZA y MODIFICA lo existente (PromoBar, Header, MainLayout, Card, ImageSlider, useStickyHeader, router, variables.css). No lo rehagas desde cero.
- Antes de borrar o mover un archivo, indica por qué en el resumen final.
- Trabaja por fases en orden. Ejecuta npm run lint al final de cada fase.

## Reglas de seguridad

- La página original es SOLO referencia. No la sirvas, no la importes desde src/ y no copies ningún <script>: contiene Google Tag Manager, OneTrust, Cloudflare, accessiBe y otros trackers del sitio real.
- No uses jQuery. Todo comportamiento se reimplementa en React.

## Fase 1 — Preparar referencia y assets

1. Renombra la carpeta _files a original-home-files y el HTML a original-home.html; actualiza las rutas dentro del HTML.
2. Extrae los assets oficiales y reemplaza los vectorizados automáticamente:
   - brandlogo-drh.svg → src/assets/logo/dr-horton-logo.svg
   - SVG inline del badge redtag de la PromoBar (viewBox 0 0 26 14) → RedTagBadge en components/ui/, fill="currentColor"
   - SVG inline de la flecha de la PromoBar (viewBox 0 0 15 15)
   - DRH-heart-REA.svg → src/assets/icons/heart.svg
   - Íconos sociales → src/assets/icons/social/
   - RTE-Header-Image-Desktop.jpg (y versión mobile si existe) → src/assets/images/hero/ en .webp
   - Chevron del directorio de estados (SVG inline)

## Fase 2 — Tokens reales

3. Lee main.min.css y home.css y reescribe src/styles/variables.css con los valores REALES: colores (rojo #D10000, navy #00205B, azul de links, grises, fondos), familia tipográfica real con sus pesos (si no está en Google Fonts, usa la alternativa más cercana y dime cuál es la original), escala de tamaños, interlineados, radios, sombras, espaciados, ancho del .frame y breakpoints. Actualiza el import de fuentes en index.html.

## Fase 3 — Datos

4. Todo el contenido real a archivos data/ (textos, links, aria-labels, títulos):
   - PromoBar → /red-tag-event
   - Nav: Who we are, Smart home, Services, Customer care
   - Hero: h1 "Red Tag Savings are here.", h2 "Shop move-in ready homes by November 1.", placeholder del buscador, botón Map view → /globalmap
   - Las 5 tarjetas con sus textos, links y aria-labels exactos
   - Footer: 4 secciones (About D.R. Horton, Resources, Finance Your Home, Legal Information), redes sociales, copyright y texto Equal Housing
   - Lista completa de estados y mercados del footer (slug, nombre, estado al que pertenece) → src/features/locations/data/statesIndex.js
   - Links internos usan rutas relativas con <Link>. Links externos (customerportal, investor, dhimortgage, privacy-central, redes sociales) abren en pestaña nueva con rel="noopener noreferrer".

## Fase 4 — Construcción idéntica al original

Replica estructura, medidas, espaciados y comportamiento responsive del original para desktop, tablet y mobile.

5. PromoBar: idéntica (badge + "Save big on homes near you." + "Act now" + flecha). Fuente, tamaños y alto según el CSS original.
6. Header: logo + nav agrupados a la izquierda, botón hamburguesa animado en mobile, link "Skip to main content" accesible, sticky si el original lo es. Menú mobile: cierra con link, cambio de ruta, Escape y clic fuera; bloquea el scroll del body.
7. Hero: imagen de fondo real con la composición del original, h1, h2, SearchBar y botón Map view. El buscador funciona como combobox accesible: sugiere estados y mercados desde statesIndex.js mientras se escribe, navega con flechas y Enter, y lleva a /:state o /:state/:area.
8. Tiles (FeatureGrid): misma grilla que el original (tarjeta RedTag grande + 2 columnas de 2 tarjetas), mismos radios, sombras y hover.
   - La tarjeta RedTag usa el video de Vimeo del original (iframe 16:9) con parámetros background=1 (autoplay, muted, loop, sin controles) y dnt=1, cargado de forma diferida.
   - Si el usuario tiene prefers-reduced-motion, muestra en su lugar el ImageSlider pausado o una imagen estática.
   - El corazón de "We ❤ real estate agents" es heart.svg.
9. Footer (componente compartido en components/layout/Footer, no en features/home):
   - SiteMap con el título "Starting your search? Find your new D.R. Horton home in these areas." y la grilla de estados.
   - Replica el comportamiento original: al hacer clic en el chevron de un estado se ocultan los demás, aparece el panel "Areas in <Estado>" con sus mercados y la página se desplaza hacia él; un segundo clic lo cierra. aria-expanded y manejo de foco correctos. El nombre del estado es link a /:state.
   - Footer nav de 4 columnas, redes sociales, barra legal y copyright, incluyendo las variantes mobile (social--mobile, legal--mobile).
10. Elimina el placeholder y la prueba temporal del ImageSlider de HomePage. Elimina la sección StatesDirectory de features/home si ya no se usa (su función pasa al Footer). Conserva ImageSlider en components/ui para otros módulos.

## Fase 5 — Rutas y pendientes

11. Si aún no existen:
    - Páginas ComingSoon y NotFound.
    - Rutas /who-we-are, /smart-home, /services, /customer-care, /red-tag-event, /real-estate-agents, /military-benefits, /globalmap y "*" dentro de MainLayout.
    - Scroll to top al cambiar de ruta.
    - Estado inicial correcto en useStickyHeader.
    - Rutas dinámicas /:state y /:state/:area que resuelven contra statesIndex.js (por ahora pueden mostrar ComingSoon con el nombre del estado o área); slug inexistente → NotFound. Las rutas fijas tienen prioridad sobre las dinámicas.

## Fase 6 — Verificación

12. Compara pieza por pieza con el CSS y el HTML originales en 1440px, 1024px, 768px y 375px de ancho.
13. Crea docs/reference/original-home/NOTES.md con: fuente original y la usada, decisiones tomadas, comportamientos replicados y diferencias que queden.
14. npm run lint y npm run build sin errores.

## Entrega

Al terminar, entrégame:
- Tabla de archivos creados, modificados, movidos y eliminados (con el motivo).
- Lista de diferencias pendientes con el original.
