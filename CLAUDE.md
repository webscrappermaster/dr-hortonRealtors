# D.R. Horton — Reglas del proyecto

## Stack
- React 19 + Vite + JavaScript
- React Compiler (no usar `useMemo`/`useCallback` manualmente)
- React Router DOM v7
- CSS Modules para estilos por componente

---

## Arquitectura por features

Cada módulo nuevo vive en `src/features/<nombre>/` con la siguiente estructura interna:

```
features/<nombre>/
├── components/       # Componentes exclusivos del módulo
│   └── MiComponente/
│       ├── MiComponente.jsx
│       ├── MiComponente.module.css
│       └── index.js
├── data/             # Contenido estático (textos, links, listas)
├── hooks/            # Hooks específicos del módulo (opcional)
├── services/         # Llamadas a API del módulo (opcional)
└── NombrePage.jsx    # Página principal del módulo
```

Lo que se comparte entre dos o más módulos sube a:
- `src/components/` — componentes reutilizables (layout y ui)
- `src/hooks/` — hooks reutilizables
- `src/services/` — servicios compartidos
- `src/utils/` — funciones utilitarias puras

---

## Reglas de componentes

- Cada componente en su propia carpeta: `Componente.jsx` + `Componente.module.css` + `index.js`.
- Nombres en **PascalCase**.
- El `index.js` solo re-exporta: `export { default } from './Componente'`.
- No crear componentes de un solo uso dentro de otro archivo; siempre carpeta propia.

---

## Estilos

- **CSS Modules** exclusivamente para estilos por componente.
- Colores, tipografía, espaciados y radios **solo desde variables CSS** definidas en `src/styles/variables.css`. Nunca valores sueltos (ej: `color: #c8102e` está prohibido; usar `color: var(--color-primary)`).
- Diseño **responsive mobile-first**: escribir los estilos base para móvil y agregar `@media (min-width: ...)` para pantallas mayores.
- Breakpoints de referencia: mobile `< 640px`, tablet `640px–1023px`, desktop `≥ 1024px`, wide `≥ 1280px`.

---

## Contenido estático

- Textos, links, listas y cualquier dato fijo van en archivos `data/` del módulo correspondiente.
- Los componentes recorren esos datos con `.map()`, nunca hardcodean contenido en JSX.

---

## React Compiler

- **No usar** `useMemo`, `useCallback` ni `React.memo` manualmente.
- El compilador optimiza automáticamente. Agregar memoización manual puede interferir.

---

## Accesibilidad

- HTML semántico: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`, etc.
- Atributo `alt` descriptivo en todas las imágenes; `alt=""` solo para imágenes decorativas.
- `aria-label` en botones que solo contienen un ícono (sin texto visible).
- Asegurar contraste de color suficiente (mínimo WCAG AA).

---

## Comentarios

- Comentarios **en español**.
- Solo cuando el **por qué** no es obvio: una restricción oculta, un workaround, comportamiento sorpresivo.
- No comentar qué hace el código; los nombres descriptivos ya lo explican.
- No docstrings multi-línea.

---

## Router

- Rutas definidas en `src/app/router/router.jsx`.
- Cada feature expone su página principal y el router la importa directamente.
- Usar `<Link>` de react-router-dom, nunca `<a>` para navegación interna.

---

## Mockups

- Los mockups de cada módulo están en `docs/mockups/<modulo>/`.
- Antes de construir cualquier componente, consulta el mockup correspondiente.
- Los archivos siguen el patrón `NN-nombre.webp` (ej: `01-hero.webp`).
- La identidad de marca de referencia (logo, redtag) está en `docs/mockups/brand/`.

---

## Convenciones de nombrado

| Elemento | Convención |
|---|---|
| Componentes | PascalCase |
| Archivos de componente | PascalCase.jsx |
| CSS Modules | PascalCase.module.css |
| Hooks | camelCase con prefijo `use` |
| Utilidades | camelCase |
| Archivos de data | camelCase (ej: `navLinks.js`) |
| Variables CSS | kebab-case con prefijo semántico |
