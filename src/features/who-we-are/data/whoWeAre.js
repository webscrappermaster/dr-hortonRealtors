/* Textos, imágenes y links de /who-we-are — docs/reference/who-we-are/who-we-are.html.
   NOTA: el slider "My Story" del original se renderiza como grid estático porque
   SliderCards es un componente de Etapa 3; el contenido se preserva íntegro. */

import topMaryland from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_Maryland-Tradition-Series-Exterior.webp'
import topHardin from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_md_My-Story-Hardin-Family.webp'
import topFloridaTownhome from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_sm_Florida-Townhome-Exterior.webp'
import topHoopili from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg-1.webp'
import topOregon from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_sm_Oregon-Tradition-Exterior.webp'
import topWoodcrest from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_md_Emerald_WA_Woodcrest_Exterior.webp'
import topAcosta from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_My-Story-Acosta-Family.webp'
import topIndianapolis from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_My-Story-Indianapolis.webp'
import topCentralValley from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_sm_Central-Valley-Express-Exterior.webp'
import topSaltLake from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_md_W_Salt-Lake-City_Foothill-Village_Exterior.webp'
import topDunn from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_My-Story-Dunn-Family.webp'
import topHayden from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_md_Florida-Hayden-Model.webp'
import topKabi from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_md-My-Story-Kabi-Family.webp'
import topAlbuquerque from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_AZ-S-Albuquerque.webp'

import storyKanika from '../../../assets/images/who-we-are/DR-Horton_My-Story_Kanika.webp'
import storyAlexandria from '../../../assets/images/who-we-are/DR-Horton_My-Story_Alexandria-and-Richard.webp'
import storyCassie from '../../../assets/images/who-we-are/DR-Horton_My-Story_Cassie-and-Matthew.webp'
import storyBrooks from '../../../assets/images/who-we-are/DR-Horton_My-Story_Brooks-Family.webp'
import storyKoda from '../../../assets/images/who-we-are/DR-Horton_My-Story_Koda.webp'
import storyAlvarez from '../../../assets/images/who-we-are/DR-Horton_My-Story_Alvarez-Family.webp'

import bottomCape from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_Cape.webp'
import bottomGolfCart from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_sm-Golf-Cart.webp'
import bottomSacramento from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_Sacramento-Teambuilding.webp'
import bottomLasVegas from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_Las-Vegas-Construction.webp'
import bottomSalesFL from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_md_Sales-Agents-Florida.webp'
import bottomSalesTeam from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_md-Sales-Team.webp'
import bottomPanama from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_md_Panama-City-Grand-Opening.webp'
import bottomOklahoma from '../../../assets/images/who-we-are/DR-Horton_Who-we-are_lg_Oklahoma-Home-Garden-Show.webp'

import hfesLogo from '../../../assets/images/who-we-are/L1_DRH-CO_HFES_Logo_Blue_Black.svg'

export const topCollage = [
  [
    { src: topMaryland, alt: 'Maryland Tradition Series Exterior' },
    { src: topHardin, alt: 'Hardin family in front of their new home' },
  ],
  [
    { src: topFloridaTownhome, alt: 'Florida townhome exterior' },
    { src: topHoopili, alt: 'Guillermo and Acacio in front of their new Hoopili home' },
    { src: topOregon, alt: 'Oregon Tradition home exterior' },
  ],
  [
    { src: topWoodcrest, alt: 'Washington Woodcrest home exterior' },
    { src: topAcosta, alt: 'Acosta family in front of their new home' },
  ],
  [
    { src: topIndianapolis, alt: 'Family in Indianapolis in front of their new home' },
    { src: topCentralValley, alt: 'Central Valley Express exterior' },
  ],
  [
    { src: topSaltLake, alt: 'Salt Lake City Foothill Village Exterior' },
    { src: topDunn, alt: 'The Dunn family holding the keys to their new home' },
    { src: topHayden, alt: 'Florida Hayden model' },
  ],
  [
    { src: topKabi, alt: 'Kabi family in front of their new home' },
    { src: topAlbuquerque, alt: 'South Albuquerque home' },
  ],
]

export const heroTitle = "Together, we are America's builder."

export const buildingEveryDay = {
  title: "We're building every day.",
  paragraphs: [
    'From our first home in 1978 to over 1,000,000 homes in 2023, our mission remains the same — to deliver quality and affordability across the country.',
    'Since 2002, more people have chosen D.R. Horton than any other builder. Buy or rent, we have homes and services to provide a home for every stage in life.',
  ],
}

export const myStorySectionTitle = 'My Story'

export const myStoryCards = [
  {
    image: storyKanika,
    imageAlt: 'Mother and son on their new patio',
    quote:
      'One week as a homeowner and I’m still clapping for myself. This was one of my hardest goals to achieve. Here I am, 41, and a first-time homeowner.',
    name: 'Kanika',
    state: 'Texas',
  },
  {
    image: storyAlexandria,
    imageAlt: 'Husband and wife jumping in front of new house',
    quote:
      'As first-time homebuyers, we had some nerves while starting the home-buying process but quickly felt at ease by everyone from the D.R. Horton team and our realtor.',
    name: 'Alexandria and Richard',
    state: 'Texas',
  },
  {
    image: storyCassie,
    imageAlt: 'Happy family in front of new house',
    quote:
      'Our sales agent Paul went above and beyond to ensure we were taken care of. Our building superintendent, Glenn was also fantastic. We love D.R. Horton!!',
    name: 'Cassie and Matthew',
    state: 'South Carolina',
  },
  {
    image: storyBrooks,
    imageAlt: 'Husband and wife with welcome sign',
    quote:
      'We are so excited with our D.R. Horton smart home! Our DHI lender Connie and our sales rep Tony were the best!',
    name: 'Vendell and Jamara',
    state: 'North Carolina',
  },
  {
    image: storyKoda,
    imageAlt: 'Happy woman celebrating new home',
    quote: "I'm officially a new homeowner & Koda is excited for his new backyard!",
    name: 'Yesica',
    state: 'Georgia',
  },
  {
    image: storyAlvarez,
    imageAlt: 'Couple in front of home',
    quote:
      'Our home buying process was outstanding. From the realtor showing us our soon-to-be home for the very first time, to the final walkthrough with the superintendent, we were amazed!',
    name: 'Fernando and Katie',
    state: 'Alabama',
  },
]

export const moreThanBuilder = {
  title: "We're more than just your homebuilder.",
  tiles: [
    {
      title: 'DHI Mortgage',
      description: 'Get a seamless experience with your financial goals in mind.',
      ctaLabel: 'Learn more',
      href: 'https://www.dhimortgage.com/affiliate/?target=http://www.dhimortgage.com',
      external: true,
    },
    {
      title: 'DHI Title',
      description: "When it's all said and done, you can take care of your title.",
      ctaLabel: 'Learn more',
      href: 'https://www.dhimortgage.com/affiliate/?target=http://www.dhititle.com',
      external: true,
    },
    {
      title: 'DRH Insurance',
      description: 'After you buy, we have options to protect your home and possessions.',
      ctaLabel: 'Learn more',
      href: 'http://www.dhimortgage.com/affiliate/?target=http://www.drhortoninsurance.com&return=www.drhorton.com/Other-Pages/Finance-Your-Home.aspx',
      external: true,
    },
  ],
}

export const bottomCollage = [
  [{ src: bottomCape, alt: 'Man in D.R. Horton cape' }],
  [
    { src: bottomGolfCart, alt: 'D.R. Horton golf cart and riders' },
    { src: bottomSacramento, alt: 'Sacramento team building' },
  ],
  [
    { src: bottomLasVegas, alt: 'Las Vegas construction team' },
    { src: bottomSalesFL, alt: 'Florida sales agents' },
  ],
  [
    { src: bottomSalesTeam, alt: 'Happy sales team' },
    { src: bottomPanama, alt: 'Panama City grand opening celebration' },
  ],
  [{ src: bottomOklahoma, alt: 'Dog in D.R. Horton shirt at Oklahoma Home Garden Show' }],
]

export const comeWorkWithUs = {
  title: 'Come work with us',
  description:
    'When you have good people, good things happen. Find your career at D.R. Horton — we build people too.®',
  cta: { label: 'Join the team', href: '/careers' },
}

export const hfesLogoAsset = {
  src: hfesLogo,
  alt: 'Home For Every Stage logo',
}
