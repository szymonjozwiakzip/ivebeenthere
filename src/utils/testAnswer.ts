import { getPolishAliases, UK_REGION_ALIASES } from '@/data/countryAliases';
import { UK_REGION_LABELS } from '@/data/countries';

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function checkCountryAnswer(
  input: string,
  countryId: string,
  countryNames: Map<string, string>,
): boolean {
  const normalized = normalize(input);
  if (!normalized) return false;

  const accepted = new Set<string>();
  const displayName = countryNames.get(countryId);
  if (displayName) accepted.add(normalize(displayName));
  accepted.add(normalize(countryId));
  getPolishAliases(countryId).forEach((alias) => accepted.add(normalize(alias)));

  if (countryId === 'GBR') {
    accepted.add(normalize('great britain'));
    accepted.add(normalize('wielka brytania'));
    accepted.add(normalize('uk'));
    Object.values(UK_REGION_LABELS).forEach((label) => accepted.add(normalize(label)));
    Object.keys(UK_REGION_ALIASES).forEach((alias) => accepted.add(normalize(alias)));
  }

  return accepted.has(normalized);
}
