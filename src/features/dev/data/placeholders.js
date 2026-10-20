/* Placeholders SVG inline para la página /dev/components.
   No usamos las imágenes de docs/reference/ (están fuera de src/) ni URLs externas;
   para verificar layout basta con bloques de color etiquetados. */

export function placeholder({ w = 800, h = 500, label = '', bg = '#CBD5E1', fg = '#1E293B' }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <text x="50%" y="50%" font-family="Figtree, Arial, sans-serif" font-size="${Math.min(w, h) * 0.08}" font-weight="700" fill="${fg}" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
