import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import HomePage from '../../features/home/HomePage'
import ComingSoon from '../../features/common/ComingSoon'
import NotFound from '../../features/common/NotFound'
import LocationPage from '../../features/locations/LocationPage'

/* Rutas fijas → prioridad sobre las dinámicas de :state.
   Las slugs reservadas evitan colisiones con nombres de estados. */
const FIXED_ROUTES = [
  { path: 'who-we-are',          title: 'Who we are' },
  { path: 'smart-home',          title: 'Smart home' },
  { path: 'services',            title: 'Services' },
  { path: 'customer-care',       title: 'Customer care' },
  { path: 'red-tag-event',       title: 'Red Tag Event' },
  { path: 'real-estate-agents',  title: 'Real estate agents' },
  { path: 'military-benefits',   title: 'Military benefits' },
  { path: 'globalmap',           title: 'Map view' },
  { path: 'contact-us-page',     title: 'Contact' },
  { path: 'careers',             title: 'Careers' },
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

      { path: ':state',        element: <LocationPage /> },
      { path: ':state/:area',  element: <LocationPage /> },

      { path: '*', element: <NotFound /> },
    ],
  },
])
