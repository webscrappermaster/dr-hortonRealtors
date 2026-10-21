import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import HomePage from '../../features/home/HomePage'
import ComingSoon from '../../features/common/ComingSoon'
import NotFound from '../../features/common/NotFound'
import LocationPage from '../../features/locations/LocationPage'
import ComponentsPreviewPage from '../../features/dev'
import ServicesPage from '../../features/services'
import CustomerCarePage from '../../features/customer-care'
import CareersPage from '../../features/careers'
import WhoWeArePage from '../../features/who-we-are'

/* Rutas fijas → prioridad sobre las dinámicas de :state.
   Las slugs reservadas evitan colisiones con nombres de estados. */
const FIXED_ROUTES = [
  { path: 'smart-home',          title: 'Smart home' },
  { path: 'red-tag-event',       title: 'Red Tag Event' },
  { path: 'real-estate-agents',  title: 'Real estate agents' },
  { path: 'military-benefits',   title: 'Military benefits' },
  { path: 'globalmap',           title: 'Map view' },
  { path: 'contact-us-page',     title: 'Contact' },
  { path: 'warranty',            title: 'Warranty' },
  { path: 'epa-consent-decree',  title: 'EPA Consent Decree' },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },

      ...FIXED_ROUTES.map(({ path, title }) => ({
        path,
        element: <ComingSoon title={title} />,
      })),

      { path: 'who-we-are',    element: <WhoWeArePage /> },
      { path: 'services',      element: <ServicesPage /> },
      { path: 'customer-care', element: <CustomerCarePage /> },
      { path: 'careers',       element: <CareersPage /> },

      /* Ruta temporal — preview de componentes nuevos durante el desarrollo.
         Se elimina junto con src/features/dev al final del proyecto. */
      { path: 'dev/components', element: <ComponentsPreviewPage /> },

      { path: ':state',        element: <LocationPage /> },
      { path: ':state/:area',  element: <LocationPage /> },

      { path: '*', element: <NotFound /> },
    ],
  },
])
