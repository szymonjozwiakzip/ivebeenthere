import type { Continent, ContinentStats, ExportScope, ExportYearFilter, Visit } from '@/types';
import { CONTINENT_ORDER } from '@/data/constants';
import { COUNTRY_CONTINENTS } from '@/data/countries';

export function getCountriesByContinent(continent: Continent): string[] {
  return Object.entries(COUNTRY_CONTINENTS)
    .filter(([, c]) => c === continent)
    .map(([id]) => id);
}

export function filterVisitsByYear(
  visits: Visit[],
  yearFilter: ExportYearFilter,
): Visit[] {
  if (yearFilter === 'all') return visits;
  return visits.filter((v) => v.year === yearFilter);
}

export function filterVisitsByScope(
  visits: Visit[],
  scope: ExportScope,
): Visit[] {
  if (scope === 'world') return visits;
  const continentCountries = new Set(getCountriesByContinent(scope));
  return visits.filter((v) => continentCountries.has(v.countryId));
}

export function computeContinentStats(
  visitedIds: Set<string>,
): ContinentStats[] {
  return CONTINENT_ORDER.map((continent) => {
    const countries = getCountriesByContinent(continent);
    const visited = countries.filter((id) => visitedIds.has(id)).length;
    const total = countries.length;
    return {
      continent,
      visited,
      total,
      percentage: total > 0 ? Math.round((visited / total) * 100) : 0,
    };
  });
}

export function getVisitedIds(visits: Visit[]): Set<string> {
  return new Set(visits.map((v) => v.countryId));
}

export function getVisitYears(visits: Visit[]): number[] {
  const years = new Set<number>();
  visits.forEach((v) => {
    if (v.year) years.add(v.year);
  });
  return Array.from(years).sort((a, b) => b - a);
}

export function getWorldStats(visitedIds: Set<string>): {
  visited: number;
  total: number;
  percentage: number;
} {
  const total = Object.keys(COUNTRY_CONTINENTS).length;
  const visited = [...visitedIds].filter((id) => id in COUNTRY_CONTINENTS).length;
  return {
    visited,
    total,
    percentage: total > 0 ? Math.round((visited / total) * 100) : 0,
  };
}
