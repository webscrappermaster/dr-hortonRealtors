/* Textos, imágenes y links de /careers — docs/reference/careers/careers.html. */

import collageConstruction from '../../../assets/images/careers/DR-Horton_Careers_lg_team-construction.webp'
import collageDelaware from '../../../assets/images/careers/DR-Horton_Careers_md-Delaware-Community.webp'
import collagePanama from '../../../assets/images/careers/DR-Horton_Careers_md-Panama-City-Opening.webp'
import orlandoInterns from '../../../assets/images/careers/Orlando_1.webp'
import headquarters from '../../../assets/images/careers/DR-Horton_Careers_DR-Horton-Headquarters.webp'

export const hero = {
  title: 'We build people too.',
  trademark: '®',
  paragraphs: [
    "Our people are the story, and everywhere you look, you will find hard-working professionals that know it's way more than just a job.",
    'There is a culture here at D.R. Horton, and it is our people that make the difference every single day.',
  ],
}

export const collage = [
  [{ src: collageConstruction, alt: 'D.R. Horton construction team' }],
  [
    { src: collageDelaware, alt: 'Delaware community team' },
    { src: collagePanama, alt: 'Panama City grand opening' },
  ],
]

export const joinTheTeam = {
  title: 'Join the team',
  description:
    'D.R. Horton employs thousands of passionate team members. However, we still operate with that small business mentality and the mission to do what is right for the people around you.',
  benefits: [
    'Comprehensive Health Insurance Plans',
    'Dental & Vision Plans',
    'Life Insurance Plans',
    'Disability Plans',
    'Flexible Benefit Accounts',
    '401(k) Plan',
    'Employee Stock Purchase Program',
    'Paid Time Off',
    'Paid Parental Leave',
  ],
}

export const tiles = [
  {
    title: 'Future employees',
    description:
      "We're hiring all across the nation, and we can't wait to say welcome to the team!",
    ctaLabel: 'Apply now',
    href: 'https://drhorton.taleo.net/careersection/2/jobsearch.ftl?lang=en',
    external: true,
  },
  {
    title: 'Internship program',
    description: 'Get experience in the industry by joining our internship program.',
    ctaLabel: 'Learn more',
    href: 'https://www.drhorton.com/internships',
    external: true,
  },
]

export const programs = [
  {
    image: orlandoInterns,
    imageAlt: 'Interns at D.R. Horton',
    imageSide: 'right',
    title: 'Interested in interning?',
    description:
      "Every year, interns are hosted all across the country in D.R. Horton divisions. There's no coffee fetching here — interns learn on the job and gain real-world experience.",
    cta: {
      label: 'Start your career',
      href: 'https://www.drhorton.com/internships',
      external: true,
    },
  },
  {
    image: headquarters,
    imageAlt: 'D.R. Horton headquarters',
    imageSide: 'left',
    title: 'National transfer program',
    description:
      'D.R. Horton provides a national transfer program to all employees and subsidiaries. We want our people to pursue a higher level position or lateral transfer nationwide they qualify for within the company. As positions become available, they are posted for employee consideration first.',
    cta: {
      label: 'Go further',
      href: 'https://drhorton.taleo.net/careersection/1/jobsearch.ftl?lang=en',
      external: true,
    },
  },
]
