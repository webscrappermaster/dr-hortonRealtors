import { useParams } from 'react-router-dom'
import { statesIndex } from './data/statesIndex'
import ComingSoon from '../common/ComingSoon'
import NotFound from '../common/NotFound'

/* Resuelve rutas /:state y /:state/:area contra statesIndex.
   - Slug válido → placeholder ComingSoon con nombre bonito.
   - Slug inexistente → NotFound. */
function LocationPage() {
  const { state: stateSlug, area: areaSlug } = useParams()

  const state = statesIndex.find(s => s.slug === stateSlug)
  if (!state) return <NotFound />

  if (!areaSlug) {
    return <ComingSoon title={state.name} subtitle={`${state.markets.length} markets available`} />
  }

  const market = state.markets.find(m => m.slug === areaSlug)
  if (!market) return <NotFound />

  return <ComingSoon title={market.name} subtitle={`In ${state.name}`} />
}

export default LocationPage
