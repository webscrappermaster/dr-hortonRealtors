# Guía de administración — Panel /admin

Instrucciones paso a paso para configurar y usar el panel de ajustes del sitio.
Sin tecnicismos, todo en orden.

---

## 1. Crear el almacenamiento en Vercel (solo la primera vez)

1. Entra a [vercel.com](https://vercel.com) con tu cuenta.
2. En el menú lateral izquierdo haz clic en **Storage**.
3. Haz clic en **Create Store** → selecciona **Edge Config**.
4. Dale un nombre (p. ej. `dr-horton-settings`) y haz clic en **Create**.
5. En la pestaña **Settings** del store recién creado, copia el **Edge Config ID**.
   Tiene el formato `ecfg_xxxxxxxxxxxxxxxx`. Lo necesitas en el paso 3.
6. En esa misma pestaña, copia también la **Connection String**
   (empieza con `edge-config://…`). También la necesitas en el paso 3.

---

## 2. Crear el token de Vercel (solo la primera vez)

> **Importante:** el token **debe** tener alcance **All Projects**, no limitarse
> a un proyecto. Un token limitado a un proyecto no puede acceder al store
> y causará el error "Storage access denied".

1. En el menú lateral de Vercel haz clic en **Account Settings** → **Tokens**.
2. Haz clic en **Create Token**.
3. Nombre: algo descriptivo, p. ej. `dr-horton-admin`.
4. Scope: elige **webscrapermaster → All Projects** (no elijas un proyecto específico).
5. Expiration: recomendado **1 year** (o sin expiración, según tu preferencia).
6. Haz clic en **Create** y copia el token que aparece — **solo se muestra una vez**.

---

## 3. Configurar las variables de entorno en Vercel

1. Ve a tu proyecto en Vercel → pestaña **Settings** → **Environment Variables**.
2. Agrega o actualiza estas seis variables:

| Variable | De dónde sale el valor |
|---|---|
| `GLOBAL_CONFIG` | Storage → tu store → Settings → **Connection String** (`edge-config://…`) |
| `GLOBAL_CONFIG_ID` | Storage → tu store → Settings → **Edge Config ID** (`ecfg_…`) |
| `VERCEL_ACCESS_TOKEN` | El token que copiaste en el paso 2 |
| `VERCEL_TEAM_ID` | Account Settings → General → **Team ID** (formato `team_xxxx`) — **obligatorio** |
| `ADMIN_PASSWORD_HASH` | El hash generado en el paso 4 |
| `SESSION_SECRET` | Una cadena aleatoria de al menos 32 caracteres (genera con el comando del paso 5) |

3. **Después de agregar o cambiar cualquier variable haz clic en Redeploy.**
   Los cambios en variables de entorno no se activan solos; el sitio necesita
   redesplegar para tomarlos.

---

## 4. Generar el hash de la contraseña

Abre una terminal en la carpeta del proyecto y ejecuta:

```
node scripts/hash-password.js
```

El script pedirá tu contraseña sin mostrarla y devolverá un hash largo.
Copia ese hash y pégalo como valor de `ADMIN_PASSWORD_HASH` en Vercel.

Para `SESSION_SECRET` puedes usar este comando en la misma terminal:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 5. Conectar el store al proyecto (solo la primera vez)

1. En Vercel, ve a tu proyecto → pestaña **Storage**.
2. Haz clic en **Connect Store** y selecciona el store que creaste en el paso 1.
3. Vercel añadirá automáticamente `EDGE_CONFIG` (una variable adicional interna).
   No la borres; la app la usa como respaldo de lectura.

---

## 6. Acceder al panel

1. Ve a `https://tu-sitio.vercel.app/admin`.
2. Escribe tu contraseña y haz clic en **Login**.
3. Desde el panel puedes cambiar:
   - **Número de WhatsApp**: solo dígitos en formato internacional sin `+`
     (ejemplo Colombia: `573001234567`, ejemplo EE. UU.: `14155551234`).
     El botón "Probar" abre WhatsApp con un mensaje de prueba para verificarlo.
   - **Sección Promo — Fecha de inicio** *(opcional)*: si se llena, la promoción
     aparecerá como rango ("Oct 9 – Dec 1"). Si se deja vacío, solo se muestra
     la fecha de cierre ("Through Dec 1").
   - **Sección Promo — Fecha de cierre**: controla cuándo expira la promoción.
     Cuando la fecha pasa, el PromoBar desaparece y las tarjetas dejan de mostrar fechas.
   - La sección de vista previa bajo las fechas muestra exactamente el texto que
     verá el visitante en el Hero, en la tarjeta Red Tag y en la barra de promo.
   - **Redes sociales — Facebook / Instagram**: pega la URL completa
     (p. ej. `https://www.facebook.com/drhortonrealtors`). Si se deja vacío,
     el ícono no aparece en el pie de página.
4. Haz clic en **Guardar**. El cambio se aplica de inmediato en todo el sitio
   sin necesidad de redesplegar.

---

## 7. Cerrar sesión

Haz clic en **Cerrar sesión** en el panel.
La sesión dura 8 horas; cerrar el navegador también la termina.

---

## 8. Probar en local (para quien desarrolla)

1. Copia `.env.example` a `.env` y rellena los valores.
2. `npm run dev` — el sitio usa `VITE_WHATSAPP_NUMBER` como respaldo si la API no responde.
3. Para probar las funciones serverless con Edge Config real:
   instala la CLI de Vercel (`npm i -g vercel`) y ejecuta `vercel dev`.

---

## Solución de problemas

| Mensaje de error | Causa | Solución |
|---|---|---|
| "Storage not configured" | Faltan `GLOBAL_CONFIG_ID` o `VERCEL_ACCESS_TOKEN` | Agregar las variables → **Redeploy** |
| "Storage not found" | `GLOBAL_CONFIG_ID` incorrecto o store no existe | Verificar que el ID empieza por `ecfg_` |
| "Storage access denied" | Token con scope limitado a un proyecto | Crear nuevo token con **All Projects** → **Redeploy** |
| El cambio no se refleja en el sitio | Variables modificadas pero sin Redeploy | Hacer **Redeploy** en Vercel |
| El panel muestra valores desactualizados | Caché del navegador | Forzar recarga: `Ctrl + Shift + R` |
