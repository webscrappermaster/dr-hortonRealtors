import { useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import NotFound from '../common/NotFound'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PropertyGallery from './components/PropertyGallery'
import CommunityHero from './components/CommunityHero'
import CommunityAside from './components/CommunityAside'
import PromoCard from './components/PromoCard'
import AmenitiesList from './components/AmenitiesList'
import SchoolsList from './components/SchoolsList'
import LotMapBanner from './components/LotMapBanner'
import FloorPlanCard from './components/FloorPlanCard'
import AvailableHomeCard from './components/AvailableHomeCard'
import LocationMap from './components/LocationMap'
import { getCommunityImage } from './data/locationLoader'
import styles from './CommunityPage.module.css'

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function CommunityPage() {
  const { community, areaLabel: loadedAreaLabel } = useLoaderData()
  const [heroImgFailed, setHeroImgFailed] = useState(false)
  if (!community) return <NotFound />

  const areaLabel = loadedAreaLabel ?? capitalize(community.areaSlug)
  const heroImageSrc = community.gallery?.length ? null : getCommunityImage(community)

  const hasDetail = !!(
    community.gallery?.length ||
    community.about ||
    community.amenities?.length ||
    community.floorPlans?.length ||
    community.availableHomes?.length
  )

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: capitalize(community.stateSlug), to: `/${community.stateSlug}` },
    { label: areaLabel, to: `/${community.stateSlug}/${community.areaSlug}` },
    { label: community.cityName },
    { label: community.name },
  ]

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <Breadcrumbs items={breadcrumbs} />

        {/* Imagen hero cuando no hay galería */}
        {heroImageSrc && !heroImgFailed && (
          <div className={styles.heroImageWrap}>
            <img
              src={heroImageSrc}
              alt={community.name}
              className={styles.heroImage}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
            />
          </div>
        )}

        {/* Galería */}
        {community.gallery?.length > 0 && (
          <div className={styles.galleryWrap}>
            <PropertyGallery items={community.gallery} communityName={community.name} />
          </div>
        )}

        {/* Hero + Aside */}
        <div className={styles.heroAside}>
          <div className={styles.heroCol}>
            <CommunityHero community={community} />
          </div>
          <aside className={styles.asideCol}>
            <CommunityAside
              communityName={community.name}
              hours={community.hours}
              phone={community.phone}
            />
            {/* Mapa pequeño con pin de la comunidad */}
            {community.location && (
              <div className={styles.miniMap}>
                <LocationMap
                  communities={[community]}
                  center={community.location}
                />
              </div>
            )}
          </aside>
        </div>

        {/* Promo */}
        {community.promoSlot && (
          <div className={styles.section}>
            <PromoCard promo={community.promoSlot} />
          </div>
        )}

        {/* About */}
        {community.about && (
          <section className={styles.about}>
            <h2 className={styles.sectionTitle}>About {community.name}</h2>
            {community.about.split('\n\n').map((para, i) => (
              <p key={i} className={styles.aboutPara}>{para}</p>
            ))}
          </section>
        )}

        {/* Amenidades */}
        {community.amenities?.length > 0 && (
          <AmenitiesList items={community.amenities} />
        )}

        {/* Escuelas */}
        {community.schools?.length > 0 && (
          <SchoolsList schools={community.schools} />
        )}

        {/* Mapa de lotes */}
        {community.lotMapUrl && (
          <LotMapBanner lotMapUrl={community.lotMapUrl} />
        )}

        {/* Planos */}
        {community.floorPlans?.length > 0 && (
          <section className={styles.section} id="floor-plans">
            <h2 className={styles.sectionTitle}>Floor Plans</h2>
            <div className={styles.plansGrid}>
              {community.floorPlans.map(plan => (
                <FloorPlanCard key={plan.code ?? plan.name} plan={plan} />
              ))}
            </div>
          </section>
        )}

        {/* Casas disponibles */}
        {community.availableHomes?.length > 0 && (
          <section className={styles.section} id="available">
            <h2 className={styles.sectionTitle}>Available Homes</h2>
            <div className={styles.homesGrid}>
              {community.availableHomes.map((home, i) => (
                <AvailableHomeCard key={home.address ?? `home-${i}`} home={home} />
              ))}
            </div>
          </section>
        )}

        {/* Aviso cuando no hay datos de detalle */}
        {!hasDetail && (
          <div className={styles.comingSoon}>
            <p className={styles.comingSoonText}>More details coming soon.</p>
          </div>
        )}

      </div>
    </main>
  )
}

export default CommunityPage
