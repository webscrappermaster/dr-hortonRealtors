import { useParams, useLoaderData } from 'react-router-dom'
import { getArea } from './data/locationLoader'
import StatePage from './pages/StatePage'
import AreaPage from './pages/AreaPage'
import StatePageEmpty from './pages/StatePageEmpty'
import AreaPageEmpty from './pages/AreaPageEmpty'
import NotFound from '../common/NotFound'

/* Resuelve /:state y /:state/:area.
   stateData viene del loader del router (import dinámico por estado). */
function LocationPage() {
  const { area: areaSlug } = useParams()
  const stateData = useLoaderData()

  if (!stateData) return <NotFound />

  if (!areaSlug) {
    if (stateData.markets?.some(m => m.communities?.length > 0)) {
      return <StatePage stateData={stateData} />
    }
    return <StatePageEmpty stateData={stateData} />
  }

  const areaData = getArea(stateData, areaSlug)
  if (!areaData) return <NotFound />

  if (areaData.communities?.length > 0) {
    return <AreaPage stateData={stateData} areaData={areaData} />
  }

  return <AreaPageEmpty stateData={stateData} areaData={areaData} />
}

export default LocationPage
