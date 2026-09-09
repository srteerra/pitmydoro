import { Filter } from 'bad-words';

const SPANISH_PROFANITY = [
  'mierda',
  'puta',
  'puto',
  'gilipollas',
  'maricon',
  'pendejo',
  'verga',
  'estupido',
  'marica',
];

const filter = new Filter();
filter.addWords(...SPANISH_PROFANITY);

const stripAccents = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const hasProfanity = (value: string): boolean => {
  const normalized = stripAccents(value).trim();
  return normalized ? filter.isProfane(normalized) : false;
};
