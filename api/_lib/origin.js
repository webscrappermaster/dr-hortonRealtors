// Verifica el header Origin en peticiones de mutación como segunda capa de
// defensa (la primera es SameSite=Strict en la cookie de sesión).
export function checkOrigin(req) {
  const origin = req.headers.origin

  // Si no viene Origin (petición same-origin sin CORS), se permite.
  if (!origin) return true

  if (process.env.VERCEL_ENV !== 'production') return true

  const siteUrl =
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)

  if (!siteUrl) return true

  return origin === siteUrl
}
