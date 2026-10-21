/* Textos y tiles de /services — tomados de docs/reference/services/services.html. */

import lgSouthCarolina from '../../../assets/images/services/DR-Horton_Services_lg-South-Carolina-Family.webp'
import mdSeattle from '../../../assets/images/services/DR-Horton_Services_md-Seattle-Tradition-Exterior.webp'
import smPhoenix from '../../../assets/images/services/DR-Horton_Services_sm-Phoenix-Traditon-Exterior.webp'
import lgHawaii from '../../../assets/images/services/DR-Horton_Services_lg-Hawaii-Family.webp'
import smFlorida from '../../../assets/images/services/DR-Horton_Services_sm-Florida-Freedom-Exterior.webp'
import mdCentralValley from '../../../assets/images/services/DR-Horton_Services_md-Central-Valley-Tradition-Exterior.webp'
import lgAustin from '../../../assets/images/services/DR-Horton_Services_lg-Austin-Welcome-Home.webp'

export const hero = {
  title: 'We keep home in the family.',
  descriptionLines: ['Buy, mortgage, title, and insurance.', 'All under one roof.'],
}

export const collage = [
  [
    { src: lgSouthCarolina, alt: 'D.R. Horton homebuyer' },
    { src: mdSeattle, alt: 'Seattle Traditon Series exterior' },
  ],
  [
    { src: smPhoenix, alt: 'Phoenix two-story home at sunset' },
    { src: lgHawaii, alt: 'Hawaii family photo' },
    { src: smFlorida, alt: 'Florida one-story home' },
  ],
  [
    { src: mdCentralValley, alt: 'Home in the Central Valley California' },
    { src: lgAustin, alt: 'Happy homebuyer with balloons' },
  ],
]

export const tiles = [
  {
    title: "It's more than financing, it's about people.",
    description:
      "We're here to provide a seamless experience with your financial goals in mind.",
    ctaLabel: 'Finance',
    href: 'https://www.dhimortgage.com/affiliate/',
    external: true,
  },
  {
    title: "When it's yours, we've got you covered.",
    description: "When it's all said and done, we can assist with title coverage.",
    ctaLabel: 'Ownership',
    href: 'https://www.dhimortgage.com/affiliate/?target=https://www.dhititle.com',
    external: true,
  },
  {
    title: "We'll help you keep your peace of mind.",
    description:
      'After you buy, we have options to protect your home and possessions.',
    ctaLabel: 'Coverage',
    href: 'https://www.dhimortgage.com/affiliate/?target=https://www.drhortoninsurance.com&return=www.drhorton.com/Other-Pages/Finance-Your-Home.aspx',
    external: true,
  },
]
