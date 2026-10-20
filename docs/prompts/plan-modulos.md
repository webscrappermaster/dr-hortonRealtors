# Plan de módulos — Páginas internas de D.R. Horton

La Home está terminada. Ahora vamos con el resto del sitio. En esta tarea NO se construye nada: solo se organizan las referencias y se arma el plan.

## Referencias disponibles

En docs/reference/ hay 14 carpetas nuevas, cada una con una página original guardada desde el navegador (HTML + carpeta _files) y, en algunas, capturas desktop.png / mobile.png:

state-georgia, area-atlanta, community-jackson-landing, who-we-are, smart-home, services, customer-care, red-tag-event, real-estate-agents, military-benefits, globalmap, contact, careers, warranty.

## Reglas (las mismas de la Home)

- Las páginas originales son SOLO referencia. No se sirven, no se importan desde src/ y no se copia ningún <script> (GTM, OneTrust, Cloudflare, accessiBe, Facebook SDK, Vimeo, etc.).
- No se copian fuentes comerciales (Decagram).
- Reutilizar todo lo que ya existe: tokens de variables.css, layout (PromoBar, Header, Footer, MainLayout), components/ui (Card, Button, SearchBar, ImageSlider, RedTagBadge, etc.), hooks, statesIndex.js, LocationPage y el router.

## Ahorro de uso

- No leas los HTML completos de una vez. Primero mapea su estructura (secciones, clases principales, encabezados) con búsquedas, y lee en detalle solo lo necesario.
- Los CSS (main.min.css y otros) probablemente se repiten entre páginas: compáralos por nombre y tamaño, y analiza solo los que sean distintos al de la Home.
- No tomes capturas en esta tarea.

## Tareas

### 1. Organizar
- En cada carpeta, renombra el HTML a <carpeta>.html y la carpeta _files a <carpeta>-files (sin espacios ni apóstrofes), y actualiza las rutas internas, como hiciste con original-home.
- Si alguna carpeta no tiene su _files o su HTML, indícalo.

### 2. Analizar cada página
Para cada una de las 14, identifica:
- Secciones que la componen, en orden (hero, bloques de texto, grillas, formularios, mapas, galerías, acordeones, etc.).
- Qué componentes existentes reutiliza y qué componentes nuevos necesita.
- Contenido dinámico: qué parte se carga con JavaScript o una API y NO quedó en el HTML guardado (listados de comunidades, mapa, buscadores, formularios). En esos casos indica si hay captura que lo muestre.
- Imágenes, videos, íconos y SVG que necesita.
- Formularios: campos, validaciones y a dónde envía (no se conectará a los servicios reales de D.R. Horton).
- CSS propio de la página, si lo tiene.

### 3. Detectar lo común
- Componentes que se repiten entre varias páginas (por ejemplo: hero interno, bloques imagen + texto, grillas de tarjetas, CTA, acordeón de FAQ, breadcrumbs, formulario de contacto, tarjeta de comunidad, galería, mapa).
- Proponer dónde va cada uno: src/components/ui/ (si lo usan varios módulos) o src/features/<modulo>/components/.
- Tokens nuevos que haga falta agregar a variables.css.

### 4. Plantillas de ubicaciones
- state-georgia, area-atlanta y community-jackson-landing son PLANTILLAS: todas las páginas de estado, área y comunidad comparten estructura y solo cambian los datos.
- Propón el esquema de datos para estado, área y comunidad basándote en lo que realmente muestran esas páginas (precios, habitaciones, baños, pies², estado de venta, series, dirección, teléfono, horario, galería, planos, casas disponibles, etc.). Usa números en precios y rangos, y null cuando un dato no exista; nunca inventar datos.
- Indica cómo se integra con statesIndex.js, LocationPage y las rutas /:state, /:state/:area y /:state/:area/:city/:community que ya existen.
- Revisa si docs/reference/cloner-analysis.md o ../cloner-referencia/ aportan algo útil y menciónalo.

### 5. Escribir el plan
Crea docs/reference/MODULES-PLAN.md con:
- Inventario de las 14 páginas (tabla: página, ruta, tipo, secciones, componentes nuevos, dificultad baja/media/alta).
- Lista de componentes compartidos nuevos con su ubicación propuesta.
- Esquema de datos de ubicaciones (estado, área, comunidad).
- Orden de construcción recomendado en ETAPAS pequeñas, empezando por los componentes compartidos y las páginas más simples, y dejando para el final las de contenido dinámico complejo (mapa global, listados de comunidades).
- Para cada etapa: qué incluye y una estimación de tamaño (pequeña / mediana / grande), pensando en que cada etapa debe caber en una sesión de uso del plan Pro.
- Preguntas abiertas o decisiones que necesito tomar.

No construyas componentes ni páginas todavía. Termina con un resumen corto y las preguntas abiertas.
