import soldSign from '../../../assets/images/real-estate-agents/DR-Horton_Real-Estate-Agents_Sold-Sign-Family.webp'
import salesOffice from '../../../assets/images/real-estate-agents/DR-Horton_Real-Estate-Agents_Sales-Office.webp'
import realtorSelfie from '../../../assets/images/real-estate-agents/DR-Horton_Real-Estate-Agents_Realtor-Selfie.webp'
import homeKey from '../../../assets/images/real-estate-agents/DR-Horton_Real-Estate-Agents_Home-Key.webp'
import stillBuilding from '../../../assets/images/real-estate-agents/DR-Horton_Real-Estate-Agents_Still-Building.webp'
import salesAgentOffice from '../../../assets/images/real-estate-agents/DR-Horton_Real-Estate-Agents_Sales-Agent-Realtor-Office.webp'

export const VIMEO_ID = '869339532'

export const heroText = {
  paragraphs: [
    'Over 80% of our sales are with our real estate partners. We cannot thank you enough for helping to bring us to our millionth home and beyond.',
    'Together, we continue to lead the nation with more homes sold year after year.',
  ],
}

export const partnerSection = {
  collage: [
    [
      { src: soldSign, alt: 'D.R. Horton Real Estate Agents Sold Sign Family' },
      { src: salesOffice, alt: 'D.R. Horton Real Estate Agents Sales Office' },
    ],
    [{ src: realtorSelfie, alt: 'D.R. Horton Real Estate Agents Realtor Selfie' }],
  ],
  heading: 'Want to partner with us?',
  subheading:
    'Our real estate commissions grew from $950 million in 2023 to more than $973 million nationally in 2024.',
  disclaimer:
    '*Amounts represent total broker commissions paid by D.R. Horton in calendar years 2023 and 2024.',
}

export const threeCards = [
  {
    image: homeKey,
    imageAlt: 'D.R. Horton Real Estate Agents Home Key',
    title: "We've got options.",
    description:
      "With our large geographic footprint, diverse product offering, and value-driven pricing, you're sure to find a home that meets your client's wish list.",
  },
  {
    image: stillBuilding,
    imageAlt: 'D.R. Horton Real Estate Agents Still Building',
    title: "We don't stop building.",
    description:
      'With or without a buyer, we keep building so you can keep finding your clients the home of their dreams.',
  },
  {
    image: salesAgentOffice,
    imageAlt: 'D.R. Horton Real Estate Agents Sales Agent Realtor Office',
    title: 'We love to work together.',
    description:
      "We know the value of the co-broker community. You're there for your clients, and we're happy to partner with you to get them the home they're looking for.",
  },
]
