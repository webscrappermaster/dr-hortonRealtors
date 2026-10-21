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
