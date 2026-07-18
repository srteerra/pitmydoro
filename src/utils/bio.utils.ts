import { Filter } from 'bad-words';

export const BIO_MAX_LENGTH = 250;

const LINK_PATTERN =
  /(https?:\/\/|www\.)|([a-z0-9-]+\.(com|net|org|io|gg|tv|co|xyz|me|dev|app|link|es|info|biz))\b/i;

const SPANISH_PROFANITY = [
  'mierda',
  'puta',
  'puto',
  'gilipollas',
  'cono',
  'maricon',
  'pendejo',
  'verga',
];

const filter = new Filter();
filter.addWords(...SPANISH_PROFANITY);

const stripAccents = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const bioHasLink = (value: string): boolean => LINK_PATTERN.test(value);

export const bioHasProfanity = (value: string): boolean => {
  const normalized = stripAccents(value).trim();
  return normalized ? filter.isProfane(normalized) : false;
};
