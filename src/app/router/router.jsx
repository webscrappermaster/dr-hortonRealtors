import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import HomePage from '../../features/home/HomePage'
import ComingSoon from '../../features/common/ComingSoon'
import NotFound from '../../features/common/NotFound'
import LocationPage from '../../features/locations/LocationPage'
import CommunityPage from '../../features/locations/CommunityPage'
import { getState, getArea, getCommunity } from '../../features/locations/data/locationLoader'
import ServicesPage from '../../features/services'
import CustomerCarePage from '../../features/customer-care'
import CareersPage from '../../features/careers'
import WhoWeArePage from '../../features/who-we-are'
import SmartHomePage from '../../features/smart-home'
import RealEstateAgentsPage from '../../features/real-estate-agents'
import RedTagEventPage from '../../features/red-tag-event'
import MilitaryBenefitsPage from '../../features/military-benefits'
import ContactPage from '../../features/contact'
import WarrantyPage from '../../features/warranty'
import GlobalMapPage from '../../features/globalmap'

/* Rutas fijas → prioridad sobre las dinámicas de :state.
   Las slugs reservadas evitan colisiones con nombres de estados. */
const FIXED_ROUTES = [
  { path: 'epa-consent-decree',              title: 'EPA Consent Decree' },
  { path: 'rentals/rentalinvestor',          title: 'Rental Investor' },
  { path: 'documents-and-guides',            title: 'Documents and Guides' },
  { path: 'contact-us---property-submittals', title: 'Property Submittals' },
]

export const router = createBrowserRouter([
  {
    path: '/admin',
    lazy: async () => {
      const { default: Component } = await import('../../features/admin/AdminPage')
      return { Component }
    },
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },

      ...FIXED_ROUTES.map(({ path, title }) => ({
        path,
        element: <ComingSoon title={title} />,
      })),

      { path: 'globalmap',             element: <GlobalMapPage /> },
      { path: 'who-we-are',           element: <WhoWeArePage /> },
      { path: 'smart-home',           element: <SmartHomePage /> },
      { path: 'real-estate-agents',   element: <RealEstateAgentsPage /> },
      { path: 'red-tag-event',        element: <RedTagEventPage /> },
      { path: 'military-benefits',   element: <MilitaryBenefitsPage /> },
      { path: 'services',      element: <ServicesPage /> },
      { path: 'customer-care', element: <CustomerCarePage /> },
      { path: 'careers',       element: <CareersPage /> },
      { path: 'contact-us-page', element: <ContactPage /> },
      { path: 'warranty',       element: <WarrantyPage /> },

{ path: ':state',         element: <LocationPage />, loader: ({ params }) => getState(params.state) },
      { path: ':state/:area', element: <LocationPage />, loader: ({ params }) => getState(params.state) },
      {
        path: ':state/:area/:city/:community',
        element: <CommunityPage />,
        loader: async ({ params }) => {
          const stateData = await getState(params.state)
          if (!stateData) return { community: null, areaLabel: null }
          const community = getCommunity(stateData, params.area, params.city, params.community)
          const area = getArea(stateData, params.area)
          return { community, areaLabel: area?.name ?? null }
        },
      },

      { path: '*', element: <NotFound /> },
    ],
  },
])
