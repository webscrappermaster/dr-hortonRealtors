import { useParams } from 'react-router-dom'
import { getState, getArea } from './data/locationLoader'
import StatePage from './pages/StatePage'
import AreaPage from './pages/AreaPage'
import StatePageEmpty from './pages/StatePageEmpty'
import AreaPageEmpty from './pages/AreaPageEmpty'
import NotFound from '../common/NotFound'

/* Resuelve /:state y /:state/:area.
   - JSON enriquecido → StatePage / AreaPage con datos reales.
   - Slug válido sin JSON → StatePageEmpty / AreaPageEmpty con plantilla completa.
   - Slug inexistente → NotFound. */
function LocationPage() {
  const { state: stateSlug, area: areaSlug } = useParams()

  const stateData = getState(stateSlug)
  if (!stateData) return <NotFound />

  if (!areaSlug) {
    if (stateData.markets?.some(m => m.communities?.length > 0)) {
      return <StatePage stateData={stateData} />
    }
    return <StatePageEmpty stateData={stateData} />
  }

  const areaData = getArea(stateSlug, areaSlug)
  if (!areaData) return <NotFound />

  if (areaData.communities?.length > 0) {
    return <AreaPage stateData={stateData} areaData={areaData} />
  }

  return <AreaPageEmpty stateData={stateData} areaData={areaData} />
}

export default LocationPage
