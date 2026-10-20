# Ajustes Home — Ronda 1

Comparé nuestra Home (localhost:5173) con el original (docs/reference/original-home/original-home.html) y hay diferencias visuales importantes. Corrige todo lo siguiente.

## 0. Herramienta de comparación visual (hazlo primero)

Dijiste que no podías abrir un navegador. Instala Playwright como devDependency (solo Chromium) y crea scripts/screenshot.js que:
- Tome capturas de página completa de http://localhost:5173 y del archivo docs/reference/original-home/original-home.html.
- En anchos 1440, 1024, 768 y 375.
- Las guarde en docs/reference/screenshots/ (ours-1440.png, original-1440.png, etc.). Agrega esa carpeta a .gitignore.
- Al capturar el original, bloquea TODAS las peticiones de red externas (route.abort para cualquier URL que no sea file://), para que no se ejecuten los trackers (GTM, OneTrust, Cloudflare, accessiBe, Vimeo).
- Agrega "screenshots" a los scripts de package.json.

IMPORTANTE: en la copia local del original la fuente Decagram NO carga y se ve en Arial. Usa el original solo para comparar layout, tamaños, espaciados, colores y orden. Para la tipografía la referencia son los mockups de docs/mockups/home/.

Después de cada sección corregida, toma capturas y compara contra el original antes de pasar a la siguiente.

## 1. Hero (problema principal: el texto tapa la foto)

- ELIMINA la tarjeta blanca flotante con sombra que envuelve el texto. No existe en el original.
- El hero es un contenedor gris claro (#f1f1f1 o el valor exacto del CSS original), con esquinas redondeadas grandes y sombra muy sutil, ancho completo dentro del margen de la página.
- Dentro, dos columnas sin superposición: texto a la izquierda (~50%) y la imagen de la familia a la derecha, centrada verticalmente. La foto nunca debe quedar tapada por el texto.
- Título "Red Tag Savings are here." más pequeño (tamaño del CSS original, aprox. 40px en desktop), gris oscuro, bold. El subtítulo rojo va inmediatamente debajo, sin espacio grande entre ambos.
- Buscador: más delgado, borde gris fino, sombra suave, placeholder más pequeño; ancho aprox. igual a la columna de texto.
- Botón "Map view": fondo BLANCO, texto azul marino bold, forma de píldora, sombra suave. No relleno azul.
- Reduce el espacio en blanco entre el header y el hero (en el original hay ~30px).
- En mobile: imagen arriba o abajo del texto según el CSS original, sin superposición.

## 2. Tarjetas (FeatureGrid)

- ELIMINA los cuadritos decorativos azules (▬▬) sobre los títulos. La clase top-squares del original no dibuja eso; revisa en home.css qué hace realmente (probablemente solo ajusta espaciado) y replícalo.
- Quita las flechas "→" de los links ("Learn more", "Work with us", "Find your home", "Tell your story", "See deals"). En el original son solo texto azul bold.
- Títulos de tarjeta más pequeños (aprox. 19px) y con el mismo ancho máximo que en el original (en el original "Stay connected to home." y "Military buyers" se parten en varias líneas).
- Texto de descripción más pequeño (aprox. 15px).
- Radio de esquinas más grande (aprox. 16–20px, según CSS original) y sombra más suave.
- En las 4 tarjetas pequeñas el contenido queda alineado hacia abajo, con espacio libre arriba, como en el original.
- Verifica que "See deals" de la tarjeta grande se vea completo.

## 3. Footer

### SiteMap (estados)
- Los estados NO deben verse como campos de formulario. Quita el borde inferior, el ancho fijo y el chevron alineado a la derecha.
- Cada estado: nombre en texto negro/gris oscuro, bold, con el chevron pequeño pegado a la derecha del nombre.
- 5 columnas en desktop, ordenadas en sentido de columna (de arriba hacia abajo: Alabama, Arizona, Arkansas, California, Colorado, Delaware, Florida, Georgia en la primera columna, y así).
- El título "Starting your search? Find your new D.R. Horton home in these areas." grande y bold, como en el original.
- Línea divisoria gris fina arriba y abajo de la sección.

### Links del footer
- En desktop NO se muestran los títulos de sección (About D.R. Horton, Resources, Finance Your Home). Revisa en el CSS original si solo aparecen en mobile y replica ese comportamiento.
- Links en gris oscuro regular, no azules.
- 3 columnas de links a la izquierda y los 4 íconos sociales a la derecha, alineados en la MISMA fila superior. Íconos un poco más grandes y con más separación.

### Legal
- Sin franja gris y sin el título "Legal Information" en desktop.
- Todos los links legales en una sola línea, gris oscuro, separados por " · ".
- Incluye "Manage cookies" (por ahora puede abrir un aviso simple o no hacer nada, sin cargar OneTrust) y el ícono de "Your privacy choices" como en el original.
- Debajo, en la misma línea: "D.R. Horton is an Equal Housing Opportunity Builder." en peso regular (no bold) y "© 2026 D.R. Horton, Inc. All Rights Reserved".

## 4. Header

- Compara alto, tamaño del logo y padding con el original; nuestro logo y el espacio alrededor se ven más grandes.
- El original tiene una línea/sombra inferior visible también sin scroll; verifica en el CSS y replícalo.

## 5. Cierre

- Toma capturas finales en los 4 anchos y compara contra el original.
- Actualiza docs/reference/original-home/NOTES.md con lo corregido y lo que aún difiera.
- npm run lint y npm run build sin errores.
- Entrégame una lista corta de lo corregido y lo que quede pendiente.
