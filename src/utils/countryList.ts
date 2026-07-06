import type { Continent } from '@/types';
import { IOC_COUNTRIES } from '@/data/iocCountries';

export interface CountryListEntry {
  id: string;
  name: string;
  continent: Continent;
}

export function getListCountryIds(): string[] {
  return IOC_COUNTRIES.map((c) => c.ioc);
}

export function buildCountryList(
  countryNames: Map<string, string>,
): CountryListEntry[] {
  return IOC_COUNTRIES.map((c) => ({
    id: c.ioc,
    name: countryNames.get(c.ioc) ?? c.name,
    continent: c.continent,
  })).sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

export function groupCountriesByContinent(
  countries: CountryListEntry[],
): Map<Continent, CountryListEntry[]> {
  const groups = new Map<Continent, CountryListEntry[]>();
  for (const country of countries) {
    const list = groups.get(country.continent) ?? [];
    list.push(country);
    groups.set(country.continent, list);
  }
  return groups;
}
