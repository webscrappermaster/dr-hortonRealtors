import { placeholder } from './placeholders'

/* Lead block de military-benefits.html —
   image-text right lead-block + icono flag + CTA "Start the conversation". */
export const militaryLead = {
  image: placeholder({ w: 900, h: 650, label: 'Military family', bg: '#1E3A8A', fg: '#F8FAFC' }),
  imageAlt: 'Military benefits image',
  icon: placeholder({ w: 60, h: 60, label: '★', bg: 'transparent', fg: '#D10000' }),
  iconAlt: 'Flag icon',
  eyebrow: 'New homes for military buyers',
  title: "We're proud to build for those who serve.",
  description:
    "When it comes to your PCS or transition to civilian life, there are many things to consider. Luckily, D.R. Horton is there when you're on the move.",
  cta: { label: 'Start the conversation', href: '/military-benefits#contact-form' },
  imageSide: 'right',
  variant: 'lead',
}
