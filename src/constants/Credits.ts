export interface SoundCredit {
  id: string;
  trackKey: string;
  file: string;
  author: string;
  authorUrl: string;
  source: string;
  sourceUrl: string;
}

export interface CreditLink {
  id: string;
  type: 'instagram' | 'github' | 'website';
  url: string;
}

export interface PersonCredit {
  id: string;
  name: string;
  handle: string;
  work: string;
  avatar: string;
  links: CreditLink[];
}

export const SOUND_CREDITS: SoundCredit[] = [
  {
    id: 'liecio-109591',
    trackKey: 'rain1',
    file: 'rain-1.mp3',
    author: 'LIECIO',
    authorUrl:
      'https://pixabay.com/users/liecio-3298866/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=109591',
    source: 'Pixabay',
    sourceUrl:
      'https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=109591',
  },
  {
    id: 'freesound-77152',
    trackKey: 'rain2',
    file: 'rain-2.mp3',
    author: 'freesound_community',
    authorUrl:
      'https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=77152',
    source: 'Pixabay',
    sourceUrl:
      'https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=77152',
  },
  {
    id: 'dbsound-335692',
    trackKey: 'rain3',
    file: 'rain-3.mp3',
    author: 'Aleksandar Nikolic',
    authorUrl:
      'https://pixabay.com/users/dbsound-46267576/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=335692',
    source: 'Pixabay',
    sourceUrl:
      'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=335692',
  },
  {
    id: 'freesound-35637',
    trackKey: 'rainInt',
    file: 'rain-int.mp3',
    author: 'freesound_community',
    authorUrl:
      'https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=35637',
    source: 'Pixabay',
    sourceUrl:
      'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=35637',
  },
];

export const ART_CREDITS: PersonCredit[] = [
  {
    id: 'terra',
    name: 'Terra',
    handle: '@terra',
    work: 'F1 2025 liveries',
    avatar: '/images/credits/terra.svg',
    links: [
      {
        id: 'terra-instagram',
        type: 'instagram',
        url: 'https://www.instagram.com/srteerra/',
      },
    ],
  },
];
