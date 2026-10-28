# Prompt: botón de contacto por WhatsApp

Lee CLAUDE.md antes de empezar. Trabaja por partes, **commit por parte**, `npm run lint` y `npm run build` al cerrar cada parte. Si el cupo se acaba, termina la parte en curso, haz commit y detente.

## Objetivo
Agregar contacto por WhatsApp en todo el sitio:
- Un **botón flotante** visible en todas las páginas.
- Un **botón "Contact via WhatsApp"** en cada casa disponible, con un mensaje prellenado que identifique la casa.
- El número aún no existe: todo debe funcionar con un número pendiente y activarse cambiando **un solo valor**.

## Reglas
- Sin scripts ni widgets de terceros: solo enlaces `https://wa.me/<número>?text=<mensaje codificado>` con `target="_blank"` y `rel="noopener noreferrer"`.
- Ícono de WhatsApp como SVG local en `src/assets/icons/` (sin CDN). Componente propio, no librería de íconos.
- Accesible: `aria-label` descriptivo, foco visible, contraste AA, área táctil mínima de 44×44 px, respeta `prefers-reduced-motion`.
- Valores desde tokens de `variables.css` (agrega `--color-whatsapp: #25D366` y la variante oscura para hover/texto si hace falta contraste).
- Mobile-first; en móvil respeta `env(safe-area-inset-bottom)`.
- Actualiza CLAUDE.md: excepción a la regla de "sin tel/mailto/sms": se permite WhatsApp **solo con el número propio del proyecto**, configurado en un único lugar. Nunca números de D.R. Horton.

## Parte 1 — Configuración y utilidades
1. `src/config/contact.js`: exporta `WHATSAPP_NUMBER` leído de `import.meta.env.VITE_WHATSAPP_NUMBER` (solo dígitos, formato internacional, sin "+", p. ej. `573001234567`). Si no existe → `null`.
2. Crea `.env.example` con `VITE_WHATSAPP_NUMBER=` vacío y una línea de comentario explicando el formato. Verifica que `.env` esté en `.gitignore`.
3. `src/utils/whatsapp.js`:
   - `buildWhatsAppUrl(message)` → URL de wa.me con el texto codificado, o `null` si no hay número.
   - `buildHomeMessage(home, community)` → mensaje en inglés con: dirección (o "Lot X"), comunidad, ciudad y estado, precio con `formatUSD`, y la URL de la página actual de nuestro sitio.
   - `buildCommunityMessage(community)` y `buildGeneralMessage()` para los otros casos.
   - Los textos base de los mensajes deben estar en un archivo de datos (`src/config/whatsappMessages.js`) para poder cambiarlos o traducirlos sin tocar la lógica.

## Parte 2 — Componentes
1. `src/components/ui/WhatsAppButton/` con dos variantes:
   - `variant="floating"`: círculo fijo abajo a la derecha, solo ícono, con `aria-label="Contact us on WhatsApp"` y tooltip.
   - `variant="inline"`: botón con ícono + texto "Contact via WhatsApp", del ancho que indique el contenedor.
2. **Sin número configurado** (`WHATSAPP_NUMBER === null`): el botón sigue visible, pero al hacer clic abre un aviso accesible (mismo patrón del aviso "Text With Us" / "no disponible") que diga que el contacto por WhatsApp estará disponible pronto. No genera enlace ni abre wa.me.

## Parte 3 — Dónde aparece
1. **Flotante global** en `MainLayout`, en todas las páginas. Que no tape:
   - el toggle de mapa/lista en móvil de las páginas de ubicaciones,
   - botones de envío de formularios,
   - el contenido final del footer (deja espacio inferior si hace falta).
   Ocúltalo mientras haya un modal abierto (RFIModal, LegalModal, galería).
2. **AvailableHomeCard**: botón inline "Contact via WhatsApp" con `buildHomeMessage`. Solo en casas `move-in-ready`. En `under-contract` no se muestra.
3. **CommunityPage**: botón inline en el aside/CTA de la comunidad con `buildCommunityMessage`, junto a la acción de solicitar información existente.
4. **CommunityCard** (listados): no agregar botón (las tarjetas ya enlazan a la comunidad); el flotante cubre esos listados.
5. **Contact** (`/contact-us-page`): agregar WhatsApp como una opción más de contacto con `buildGeneralMessage`.

## Parte 4 — Verificación
1. Con Playwright, sin número: comprueba que el flotante aparece en `/`, `/georgia/atlanta`, `/texas/dallas` y una comunidad, y que el clic abre el aviso.
2. Con un número de prueba en `.env` (`VITE_WHATSAPP_NUMBER=10000000000`): comprueba que el `href` del botón de una casa de `/mississippi/jackson/pearl/cedar-lane` contiene la dirección, la comunidad y el precio con formato `$254,900`, codificados. Luego quita el número de prueba.
3. Captura a 390 px y 1440 px de una página de comunidad para revisar que el flotante no tape nada.
4. Lint, build, commit y `git push`.

## Al terminar
Dime exactamente qué línea debo agregar en `.env` cuando tenga el número y si hay que reiniciar `npm run dev` después.
