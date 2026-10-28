# Prompt: panel de administración + formularios que envían a WhatsApp

Lee CLAUDE.md antes de empezar. Trabaja por partes, **commit por parte**, `npm run lint` y `npm run build` al cerrar cada parte. Si el cupo se acaba, termina la parte en curso, haz commit y detente.

## Objetivo
1. Una ruta privada `/admin` (solo para la administradora) para cambiar **en tiempo real**, sin redeploy:
   - el número de WhatsApp,
   - la fecha límite de la promoción del hero de la Home ("Shop move-in ready homes by **November 1**.") y, si aparece en otros lugares (PromoBar, Red Tag Event), en todos ellos.
2. Que los formularios de interés en una casa (RFIModal "Request Information" y "Request a tour") abran WhatsApp con los datos que el cliente escribió al pulsar "Send request".

## Contexto técnico
El sitio es estático (React + Vite) desplegado en Vercel con Deployment Protection. "En tiempo real" exige guardar los ajustes fuera del código. Usa:
- **Funciones serverless de Vercel** en `/api` para leer y escribir ajustes y para el login.
- **Almacenamiento:** Vercel Edge Config (pensado para configuración que se lee mucho y se escribe poco). Antes de implementar, consulta la documentación actual de Vercel y confirma que Edge Config está disponible en el plan Hobby y sus límites de escrituras. Si no sirve, usa Upstash Redis desde el Marketplace de Vercel. Explícame la elección antes de seguir.
- **Desarrollo local:** documenta cómo probar las funciones (`vercel dev` o un mock en Vite). El sitio debe seguir funcionando con `npm run dev` usando valores por defecto si la API no responde.

## Reglas de seguridad (obligatorias)
- La seguridad está en la **autenticación**, no en que la URL sea secreta.
- Secretos solo en variables de entorno **del servidor** (nunca `VITE_`): `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` y las credenciales del almacenamiento. Nada de eso puede aparecer en el bundle; verifícalo buscando en `dist/` después del build.
- Contraseña guardada como **hash** (bcrypt o scrypt). Crea `scripts/hash-password.js` que pida la contraseña por consola y devuelva el hash para pegarlo en Vercel. La contraseña en texto plano no se guarda en ningún archivo.
- Sesión con cookie firmada `HttpOnly`, `Secure`, `SameSite=Strict`, con expiración (8 h). Botón de cerrar sesión que la invalide.
- Las rutas de escritura verifican la sesión **en el servidor** en cada petición y comprueban la cabecera `Origin`.
- Límite de intentos de login (p. ej. 5 por IP cada 15 min) con respuesta genérica ("Invalid credentials"), sin revelar si existe el usuario.
- Validación en el servidor:
  - número de WhatsApp: solo dígitos, 8 a 15, formato internacional sin "+";
  - fecha: válida y con formato ISO.
  Rechaza cualquier otro campo.
- `/admin` con `noindex`, sin enlaces desde el sitio, en un chunk aparte (lazy). La respuesta de `/api/admin/*` debe llevar `Cache-Control: no-store`.
- Registra en el almacenamiento la fecha y hora del último cambio (sin datos personales).
- Actualiza `vercel.json` si hace falta (las rutas `/api` no deben caer en el rewrite a `index.html`).

## Parte 1 — API y almacenamiento
1. `api/settings.js` (GET público): devuelve `{ whatsappNumber, promoDeadline, updatedAt }`. Caché corta (`s-maxage=60, stale-while-revalidate`).
2. `api/admin/login.js`, `api/admin/logout.js`, `api/admin/session.js` (comprueba sesión) y `api/admin/settings.js` (PUT protegido).
3. Valores por defecto en `src/config/siteSettings.js` (número `null`, fecha actual del sitio) usados si la API falla.
4. `scripts/hash-password.js` y `.env.example` actualizado con los nombres de las variables del servidor (sin valores).

## Parte 2 — Lectura en el sitio
1. Hook `useSiteSettings()` con un contexto en `MainLayout`: una sola petición a `/api/settings` por visita, con los valores por defecto mientras carga.
2. `WHATSAPP_NUMBER` deja de leerse de `VITE_WHATSAPP_NUMBER` y pasa a salir de los ajustes (mantén `VITE_WHATSAPP_NUMBER` solo como respaldo en desarrollo). Todos los botones de WhatsApp existentes usan el nuevo valor.
3. La fecha de la promoción se formatea en inglés ("December 1") con `Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })`. Busca con grep todos los textos con la fecha fija y reemplázalos.

## Parte 3 — Panel `/admin`
1. Pantalla de login (solo contraseña), accesible.
2. Panel con:
   - campo del número de WhatsApp con ayuda de formato y botón "Probar" que abre wa.me con un mensaje de prueba;
   - selector de fecha de la promoción con vista previa del texto ("Shop move-in ready homes by December 1.");
   - fecha del último cambio;
   - botón Guardar con mensajes de éxito/error accesibles, y botón Cerrar sesión.
3. Estilos con los tokens del proyecto, mobile-first.

## Parte 4 — Formularios a WhatsApp
Aplica a **RFIModal** (estado, área, comunidad y casa) y **Request a tour**. Los demás formularios (Contact, Warranty, Red Tag, Military) siguen simulados.
1. Al pulsar "Send request", tras validar: construye el mensaje con nombre, apellido, email, teléfono (si lo dio) y el contexto (estado/área/comunidad/casa con dirección y precio formateado, y la URL de la página). Plantillas en `src/config/whatsappMessages.js`.
2. Abre `https://wa.me/<número>?text=...` desde el mismo manejador del clic (para que el navegador no lo bloquee como popup); en móvil abre la app.
3. Debajo del botón, un aviso visible: "When you send this request, WhatsApp will open with your details so you can send them to us." El cliente ve el mensaje en WhatsApp antes de enviarlo.
4. **No guardar** los datos del cliente en ningún lugar (ni en la API, ni en almacenamiento, ni en consola).
5. Sin número configurado: no abre WhatsApp y muestra el aviso "WhatsApp contact will be available soon."
6. Después de abrir WhatsApp, el modal muestra el mensaje de agradecimiento existente.
7. Actualiza CLAUDE.md: RFIModal y Request a tour ya no son simulados; abren WhatsApp con el mensaje y no almacenan datos.

## Parte 5 — Verificación
1. Playwright con la API mockeada:
   - el sitio carga con valores por defecto si `/api/settings` falla;
   - cambiar la fecha en los ajustes cambia el texto del hero;
   - el `href` de WhatsApp del RFIModal contiene los datos escritos, codificados;
   - `/admin` sin sesión muestra solo el login.
2. Confirma con grep en `dist/` que no aparece ningún secreto ni hash.
3. Lint, build, commit y `git push`.

## Al terminar
Dame una lista paso a paso, en español y para alguien no técnico, de:
- qué crear en Vercel (almacenamiento) y qué variables de entorno agregar, con sus nombres exactos;
- cómo generar el hash de mi contraseña con `scripts/hash-password.js`;
- cómo entrar a `/admin` en la URL de Vercel y cambiar el número y la fecha;
- cómo probarlo en local.
