import type { Continent } from '@/types';
import { COUNTRY_CONTINENTS, getContinent, isSelectableMapFeature, mapFeatureToIoc } from '@/data/countries';
import { CONTINENT_ORDER } from '@/data/constants';
import type { TestConfig } from '@/types/test';
import type { MapViewScope } from '@/data/continentViews';
import { MAP_VIEW_CONFIGS } from '@/data/continentViews';

export function isFeatureInTestScope(
  mapFeatureId: string,
  scope: TestConfig['scope'],
): boolean {
  if (!isSelectableMapFeature(mapFeatureId)) return false;
  const ioc = mapFeatureToIoc(mapFeatureId);
  if (!ioc) return false;
  if (scope === 'world') return true;
  return scope.includes(getContinent(ioc));
}

export function belongsToTestScope(
  countryId: string,
  scope: TestConfig['scope'],
): boolean {
  if (!(countryId in COUNTRY_CONTINENTS)) return false;
  if (scope === 'world') return true;
  return scope.includes(getContinent(countryId));
}

export function buildTestCountryPool(
  scope: TestConfig['scope'],
  availableIds: Iterable<string>,
): string[] {
  const pool: string[] = [];
  for (const id of availableIds) {
    if (belongsToTestScope(id, scope)) pool.push(id);
  }
  return pool.sort((a, b) => a.localeCompare(b));
}

export function resolveTestMapView(scope: TestConfig['scope']): MapViewScope {
  if (scope === 'world') return 'world';
  if (scope.length === 1) return scope[0];
  return 'world';
}

export function getScopeLabel(scope: TestConfig['scope']): string {
  if (scope === 'world') return 'Świat';
  if (scope.length === 1) {
    const labels: Record<Continent, string> = {
      europe: 'Europa',
      asia: 'Azja',
      africa: 'Afryka',
      'north-america': 'Ameryka Północna',
      'south-america': 'Ameryka Południowa',
      oceania: 'Oceania',
      antarctica: 'Antarktyda',
    };
    return labels[scope[0]];
  }
  return `${scope.length} kontynenty`;
}

export function getSelectableContinents(): Continent[] {
  return CONTINENT_ORDER.filter((c) => c !== 'antarctica');
}

export function getMapConfigForScope(scope: TestConfig['scope']) {
  return MAP_VIEW_CONFIGS[resolveTestMapView(scope)];
}
