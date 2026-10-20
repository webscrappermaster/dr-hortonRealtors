#!/usr/bin/env node
/**
 * Extrae estados y mercados del HTML original y genera
 * src/features/locations/data/statesIndex.js
 *
 * Uso: node scripts/extract-states.js
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const HTML = 'docs/reference/original-home/original-home.html'
const OUT  = 'src/features/locations/data/statesIndex.js'

const html = await readFile(HTML, 'utf8')

const stateRe = /href="https:\/\/www\.drhorton\.com\/([a-z-]+)" aria-label="([A-Za-z-]+)"[^>]*class="([A-Za-z-]+)">([^<]+)</g
const marketRe = /class="market-footer-item ([A-Za-z-]+)" href="https:\/\/www\.drhorton\.com\/[a-z-]+\/([a-z-]+)" aria-label="([A-Za-z-]+)">([^<]+)</g

const statesMap = new Map()  // key: className (CamelCase) → { slug, name, markets[] }
let m

while ((m = stateRe.exec(html))) {
  const [, slug, aria, cls, display] = m
  if (statesMap.has(cls)) continue
  statesMap.set(cls, { slug, name: display.trim(), aria, markets: [] })
}

while ((m = marketRe.exec(html))) {
  const [, stateCls, mkSlug, mkAria, mkDisplay] = m
  const st = statesMap.get(stateCls)
  if (!st) {
    console.warn('Mercado sin estado:', stateCls, mkSlug)
    continue
  }
  st.markets.push({ slug: mkSlug, name: mkDisplay.trim(), aria: mkAria })
}

const states = Array.from(statesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
for (const s of states) s.markets.sort((a, b) => a.name.localeCompare(b.name))

const header = `/* Estados y mercados D.R. Horton — extraídos de docs/reference/original-home/original-home.html
   NO editar a mano: regenerar con \`node scripts/extract-states.js\` si cambia el HTML original.
   ${states.length} estados · ${states.reduce((n, s) => n + s.markets.length, 0)} mercados */\n\n`

const body = `export const statesIndex = ${JSON.stringify(states, null, 2)}\n`

await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(OUT, header + body, 'utf8')

console.log(`✓ ${OUT}  (${states.length} estados, ${states.reduce((n, s) => n + s.markets.length, 0)} mercados)`)
