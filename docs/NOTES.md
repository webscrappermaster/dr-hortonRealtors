# Notas de implementación — Decisiones y omisiones

## Etapa 7

### Captcha omitido en /warranty (Decisión 9)

El formulario de warranty original (warrantyentry.drhorton.com) utiliza un captcha custom
basado en imagen + texto (5 caracteres). La referencia también incluía reCAPTCHA de Google.

**Decisión tomada:** el captcha se omite por completo. No se reemplaza por un checkbox
"I'm not a robot" visual. La validación client-side del formulario es suficiente para
el entorno de desarrollo/demo.

**Para producción:** integrar hCaptcha o reCAPTCHA v3 antes de habilitar el envío real.

---

## Etapa 9 — Revisión final (2026-10-21)

### Errores de lint corregidos (Decisión 10)

**`PropertyGallery.jsx`** — Hook `useEffect` condicional (react-hooks/rules-of-hooks).
El hook debe moverse fuera del bloque condicional.

**`WarrantyForm.jsx`** — `setState` síncrono dentro de `useEffect` (react-compiler).
Reemplazar el `setSuggestions` directo dentro del effect por un pattern sin setState en body de effect.

### Touch targets aumentados (Decisión 11)

Todos los elementos interactivos deben medir al menos 44×44 px (WCAG 2.5.5).
Corregidos: hamburger (28→44px), botón de mapa del hero (42→44px), paginación (40→44px),
play/pause del slider (28→44px), flechas de galería de comunidad (40→44px).

### Colores hardcodeados pendientes

`#333333` y `#2D2C2C` aparecen en `Footer.module.css`, `SiteMap.module.css`
y `Header.module.css`. Deberían usar `--color-text-primary` o una variable semántica nueva.
Diferido para no ampliar el scope de la revisión final.

---
