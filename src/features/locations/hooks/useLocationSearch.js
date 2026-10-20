import { useState } from 'react'
import { statesIndex } from '../data/statesIndex'

/* Aplana estados y mercados en un único array indexable.
   Cada item tiene `id`, `label`, `hint`, `to` → compatible con SearchBar genérico. */
const flatIndex = (() => {
  const items = []
  for (const state of statesIndex) {
    items.push({
      id:    `state:${state.slug}`,
      kind:  'state',
      label: state.name,
      hint:  'State',
      to:    `/${state.slug}`,
    })
    for (const market of state.markets) {
      items.push({
        id:    `market:${state.slug}:${market.slug}`,
        kind:  'market',
        label: market.name,
        hint:  state.name,
        to:    `/${state.slug}/${market.slug}`,
      })
    }
  }
  return items
})()

const MAX_RESULTS = 8

/* Busca de forma case-insensitive por prefijo (prioriza) y por subcadena (secundario). */
export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState([])

  const search = (rawQuery) => {
    const query = rawQuery.trim().toLowerCase()
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const starts = []
    const includes = []
    for (const item of flatIndex) {
      const label = item.label.toLowerCase()
      if (label.startsWith(query)) {
        starts.push(item)
      } else if (label.includes(query)) {
        includes.push(item)
      }
    }

    setSuggestions([...starts, ...includes].slice(0, MAX_RESULTS))
  }

  return { suggestions, search }
}
