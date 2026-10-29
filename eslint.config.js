import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['api/**', 'scripts/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  /* Funciones serverless de Vercel: usan APIs de Node, no de navegador. */
  {
    files: ['api/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node, ...globals.nodeBuiltin },
      sourceType: 'module',
    },
  },
  /* Scripts Node (CLI helpers): usan APIs de Node, no de navegador. */
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.nodeBuiltin },
      sourceType: 'module',
    },
  },
  /* Configuración de Playwright y tests: entorno Node con globals de proceso. */
  {
    files: ['playwright.config.js', 'tests/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node, ...globals.nodeBuiltin },
      sourceType: 'module',
    },
  },
])
