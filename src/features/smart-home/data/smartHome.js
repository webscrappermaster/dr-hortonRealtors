import hicLogoSrc from '../../../assets/images/smart-home/L1_Home-Is-Connected_Logo_Black.svg'
import alarmApp from '../../../assets/images/smart-home/Home-Is-Connected_Alarm-com-app.webp'
import doorbell from '../../../assets/images/smart-home/Home-Is-Connected_Alarm-com-Doorbell.webp'
import thermostat from '../../../assets/images/smart-home/Home-Is-Connected_Honeywell-Thermostat.webp'
import lock from '../../../assets/images/smart-home/Home-Is-Connected_Kwikset_HomeConnect-620_2.webp'
import panel from '../../../assets/images/smart-home/Home-Is-Connected_Safe-Haven-Panel.webp'
import smartSwitch from '../../../assets/images/smart-home/Home-Is-Connected_Switch.webp'

import techImg from '../../../assets/images/smart-home/drhorton_smart-home-2025_tech.webp'
import farFromHomeImg from '../../../assets/images/smart-home/drhorton_smart-home-2025_far-from-home.webp'
import handsImg from '../../../assets/images/smart-home/drhorton_smart-home-2025_hands-free.webp'

export const hero = {
  title: "America's smart home<sup>®</sup>",
  subtitle: 'Check out the smart home technology in every D.R. Horton home.',
}

export const devices = [
  {
    image: panel,
    imageAlt: 'Qolsys IQ Panel',
    title: 'Qolsys IQ Panel',
    description:
      'The Qolsys panel is the central hub that talks to all the devices of your smart home. This award-winning panel bridges the entire suite of products with Bluetooth capability, Wi-Fi integration, Z-Wave access, and cellular connectivity.',
    subtitle: 'Not included in Maui, Kauai, or Hawaii Island.',
  },
  {
    image: alarmApp,
    imageAlt: 'Alarm.com app on smartphone',
    title: 'Alarm.com app',
    description:
      'Alarm.com is the heartbeat of the entire smart home system. This simple, one app solution brings the Home Is Connected® network together, so no matter where you are, your home is at your fingertips.',
    subtitle: 'Not included in Maui, Kauai, or Hawaii Island.',
  },
  {
    image: thermostat,
    imageAlt: 'Honeywell T6 Pro Z-Wave Thermostat',
    title: 'Honeywell T6 Pro Z-Wave<sup>TM</sup> Thermostat',
    description:
      'Set the perfect temperature before you get home. The Honeywell thermostat cools or heats your home using your smartphone, Qolsys panel, voice, or the thermostat itself.',
    subtitle: 'Not included in Hawaii.',
  },
  {
    image: lock,
    imageAlt: 'Kwikset HomeConnect 620 smart lock',
    title: 'HomeConnect<sup>TM</sup> 620',
    description:
      'Control your door even if you\'re not home. Lock and unlock your front door by entering your key code, or from your smart device.',
    subtitle: 'Not included in Maui, Kauai, or Hawaii Island.',
  },
  {
    image: doorbell,
    imageAlt: 'Alarm.com Video Doorbell',
    title: 'Alarm.com Video Doorbell',
    description:
      'Greet your guests from your smartphone with Alarm.com Video Doorbell, the smart video doorbell that allows you to see, hear and talk to whoever comes to your door.',
    subtitle: 'Not included in Maui, Kauai, or Hawaii Island.',
  },
  {
    image: smartSwitch,
    imageAlt: 'Smart Switch',
    title: 'Smart Switch',
    description:
      "Bring your home to life in the evenings. If you're on the go or on the couch, the Smart Switch can be turned on with your voice or smartphone.",
    subtitle: 'Not included in Maui, Kauai, or Hawaii Island.',
  },
]

export const benefits = [
  {
    image: farFromHomeImg,
    imageAlt: 'Blue door with featuring Kwikset deadbold with keypad.',
    title: "You'll never be far from home",
    description:
      'Monitor and control your home from your couch or from 500 miles away. Connect to your home with your smartphone, tablet, or computer.',
  },
  {
    image: handsImg,
    imageAlt: 'Busy mother with child using smart technology.',
    title: 'Home can be hands-free',
    description:
      "It's never been easier to settle into a new routine. Set the scene with your voice, from your phone, through the Qolsys panel - or schedule it and forget it. Your home will always be ready for you.",
  },
  {
    image: techImg,
    imageAlt: 'Closeup view of a Honeywell ProSeries smart wall thermostat',
    title: 'No more boxes of useless tech',
    description:
      'We wanted to make sure you have the right system that can grow with you. Our homes speak to Bluetooth, Wi-Fi, Z-Wave and cellular devices, allowing you to sync with almost any smart device.',
  },
]

export const hicLogo = {
  src: hicLogoSrc,
  alt: 'Home Is Connected logo',
  width: 216,
}
