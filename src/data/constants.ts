import type { Continent } from '@/types';

export const CONTINENT_LABELS: Record<Continent, string> = {
  africa: 'Afryka',
  asia: 'Azja',
  europe: 'Europa',
  'north-america': 'Ameryka Północna',
  'south-america': 'Ameryka Południowa',
  oceania: 'Oceania',
  antarctica: 'Antarktyda',
};

export const CONTINENT_ORDER: Continent[] = [
  'europe',
  'asia',
  'africa',
  'north-america',
  'south-america',
  'oceania',
  'antarctica',
];

export const MAP_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

export const STORAGE_KEY = 'ivebeenthere-visits';
