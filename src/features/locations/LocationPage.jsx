import { useParams } from 'react-router-dom'
import { getState, getArea } from './data/locationLoader'
import StatePage from './pages/StatePage'
import AreaPage from './pages/AreaPage'
import ComingSoon from '../common/ComingSoon'
import NotFound from '../common/NotFound'

/* Resuelve /:state y /:state/:area.
   - JSON enriquecido → StatePage / AreaPage con datos reales.
   - Slug válido en statesIndex sin JSON → ComingSoon.
   - Slug inexistente → NotFound. */
function LocationPage() {
  const { state: stateSlug, area: areaSlug } = useParams()

  const stateData = getState(stateSlug)
  if (!stateData) return <NotFound />

  if (!areaSlug) {
    /* Estado con datos JSON → página real */
    if (stateData.markets?.some(m => m.communities?.length > 0)) {
      return <StatePage stateData={stateData} />
    }
    return <ComingSoon title={stateData.name} subtitle={`${stateData.markets?.length ?? 0} markets available`} />
  }

  const areaData = getArea(stateSlug, areaSlug)
  if (!areaData) return <NotFound />

  /* Área con datos JSON → página real */
  if (areaData.communities?.length > 0) {
    return <AreaPage stateData={stateData} areaData={areaData} />
  }

  return <ComingSoon title={areaData.name} subtitle={`In ${stateData.name}`} />
}

export default LocationPage
