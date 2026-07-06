import { COUNTRY_CAPITALS } from '@/data/capitals';
import { getListCountryIds } from '@/utils/countryList';

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function getCapitalCountryIds(): string[] {
  return getListCountryIds().filter((id) => id in COUNTRY_CAPITALS);
}

export function getCapitalName(countryId: string): string | null {
  return COUNTRY_CAPITALS[countryId]?.capital ?? null;
}

export function checkCapitalAnswer(input: string, countryId: string): boolean {
  const entry = COUNTRY_CAPITALS[countryId];
  if (!entry) return false;

  const normalized = normalize(input);
  if (!normalized) return false;

  const accepted = new Set<string>([normalize(entry.capital)]);
  entry.aliases?.forEach((alias) => accepted.add(normalize(alias)));

  return accepted.has(normalized);
}
