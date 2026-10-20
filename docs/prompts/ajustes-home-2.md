# Ajustes Home — Ronda 2

Referencia visual principal de esta ronda: el SITIO EN VIVO (con la fuente real), capturado en docs/reference/live/ (live-hero.png, live-footer.png). El original local (original-home.html) sigue sirviendo para valores de CSS, pero renderiza en Arial.

Usa npm run screenshots para verificar cada sección antes de pasar a la siguiente.

---

## Parte A — Correcciones visuales

### A1. PromoBar
- El badge "redtag" quedó demasiado pequeño. En el original mide aprox. 44×24px (aprox. 24px de alto) a 1440. Ajusta el tamaño del SVG con un token en variables.css.
- La barra en el original mide aprox. 45px de alto (la nuestra 40px). Verifica el valor en el CSS original y ajústalo.
- Revisa que tamaño de texto, separación badge–texto y flecha coincidan con docs/mockups/home/00-promobar-cerca.png.

### A2. Header
- Links del nav más grandes (aprox. 17px en el original, revisa el valor exacto en main.min.css), peso semibold, color #333 o equivalente, y más separación horizontal entre ellos (aprox. 28px).

### A3. Hero
- El contenedor debe ser GRIS CLARO (#F1F1F1). En nuestra versión se ve blanco: revisa si la imagen de fondo lo está tapando o si el color no se aplica, y corrígelo.
- Margen lateral del contenedor aprox. 30px y margen superior aprox. 30px, como el original.
- Altura: usa la del original (60vh con el mínimo/máximo que defina su CSS) en lugar de min-height fijo.
- El bloque de texto queda centrado verticalmente dentro del contenedor.
- Título y subtítulo con peso 800 (extrabold). El subtítulo rojo pegado debajo del título.
- Buscador IGUAL al original: pill blanco más alto (aprox. 66px) y ancho (aprox. 540px a 1440), SIN borde, con sombra gris suave alrededor (aprox. 0 3px 6px rgba(0,0,0,.16); toma el valor exacto del CSS), placeholder aprox. 17px gris medio, padding izquierdo aprox. 28px.
- Botón "Map view": blanco, SIN borde, pill, sombra suave igual a la del buscador, texto navy bold aprox. 16px, aprox. 110×42px. Quita el borde navy de 2px.

### A4. Footer — alineación general
- Todo el footer (título del SiteMap, estados, links, íconos sociales y legal) alineado al MISMO margen izquierdo y derecho del .frame (aprox. 55px a 1440). Hoy los estados empiezan en 20px, los links en 36px y lo legal en 36px.

### A5. Footer — links y sociales
- Más espacio vertical entre links (aprox. 39px de línea a línea) y tamaño aprox. 16–17px, gris #333 medium.
- Íconos sociales aprox. 34px, separados aprox. 34px entre sí, alineados al borde derecho del frame.
- El ícono de Pinterest debe verse igual que los otros tres (relleno sólido oscuro, sin fondo ni borde blanco). Revisa el SVG.

### A6. Footer — legal
- Elimina la línea divisoria que hay encima de los links legales. En el original solo hay una línea: entre el SiteMap y los links del footer.
- Orden exacto: Privacy policy • Terms of use • [ícono] Your privacy choices • Legal notices • Licensing and state notices • Manage cookies • Accessibility • EPA Consent Decree.
- Separador "•" (bullet), no "·", con su espaciado.
- Tamaño aprox. 15–16px, gris #333.
- Ícono de "Your privacy choices": el ícono oficial de California (CCPA "Your Privacy Choices"): pill azul con ✓ blanco a la izquierda y ✗ azul sobre blanco a la derecha. Es un ícono publicado por la Oficina del Fiscal General de California para uso público. Créalo como SVG inline (aprox. 30×14px) a la IZQUIERDA del texto. Elimina el recuadro azul recortado actual.

---

## Parte B — Pendientes de la ronda 1

### B1. Modal legal
Porta el #legal-modal del original con un <dialog> nativo accesible:
- Los links legales (Privacy policy, Terms of use, Your privacy choices, Legal notices, Licensing and state notices, Accessibility) abren el modal con un iframe al mismo URL de privacy-central.securiti.ai que usa el original.
- Botón cerrar con aria-label, cierre con Escape y clic en el fondo, foco atrapado dentro mientras está abierto y devuelto al link al cerrar, bloqueo de scroll del body (reutiliza useBodyScrollLock).
- EPA Consent Decree sigue siendo ruta interna.
- "Manage cookies" sigue sin cargar OneTrust: en lugar del alert, muestra un pequeño aviso dentro del mismo dialog explicando que la gestión de cookies no está disponible en esta versión.

### B2. Título del hero en una línea
Verifica en 1440 y 1250 que "Red Tag Savings are here." quede en una sola línea como en el original. Si no, ajusta el ancho del frame (el original usa max-width 1520px) o la proporción de columnas (50/50) en lugar de reducir el tamaño de letra.

### B3. Capturas con Vimeo
Agrega al script de capturas una opción --wait-iframes que espere a que el iframe de Vimeo cargue (o un timeout de 5s) antes de capturar nuestra Home, para verificar la tarjeta RedTag con el video real.

### B4. Fuente
Mantén Figtree. Compara los pesos contra docs/reference/live/: si el original se ve más grueso en títulos, usa 800 en h1, h2 del hero y título del SiteMap.

### B5. Pendientes que NO se hacen ahora (solo dejar registrados en NOTES.md)
- Páginas internas (hoy ComingSoon): se construirán como módulos propios.
- SearchBar contra API real: cuando exista backend.
- Fuente Figtree servida localmente en vez de Google Fonts.

---

## Cierre
- Capturas finales en 1440, 1024, 768 y 375, comparadas contra docs/reference/live/ y el original local.
- Actualiza NOTES.md con lo corregido en la ronda 2 y lo que siga pendiente.
- npm run lint y npm run build sin errores.
- Entrega una lista corta: corregido / pendiente.
