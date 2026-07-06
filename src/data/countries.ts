import type { Continent, UkRegion } from '@/types';
import {
  IOC_BY_CODE,
  IOC_CODES,
  IOC_COUNTRIES,
  ISO_TO_IOC,
  IOC_TO_ISO,
} from '@/data/iocCountries';
import { COUNTRY_NAME_TO_ISO } from '@/data/countryNames';

export const UK_CONSTITUENT_IDS = ['ENG', 'SCT', 'WLS', 'NIR'] as const;
export type UkConstituentId = (typeof UK_CONSTITUENT_IDS)[number];

export const UK_REGION_LABELS: Record<UkRegion, string> = {
  ENG: 'Anglia',
  SCT: 'Szkocja',
  WLS: 'Walia',
  NIR: 'Irlandia Północna',
};

/** Kontynent wg kodu MKOl */
export const COUNTRY_CONTINENTS: Record<string, Continent> = Object.fromEntries(
  IOC_COUNTRIES.map((c) => [c.ioc, c.continent]),
);

export function isUkConstituent(mapFeatureId: string): mapFeatureId is UkConstituentId {
  return (UK_CONSTITUENT_IDS as readonly string[]).includes(mapFeatureId);
}

export function isIocCountry(countryId: string): boolean {
  return IOC_CODES.has(countryId);
}

/** Id geometrii mapy (ISO lub ENG/SCT/WLS/NIR) → kod MKOl */
export function mapFeatureToIoc(mapFeatureId: string): string | null {
  if (isUkConstituent(mapFeatureId)) return 'GBR';
  if (IOC_CODES.has(mapFeatureId)) return mapFeatureId;
  return ISO_TO_IOC[mapFeatureId] ?? null;
}

export function isSelectableMapFeature(mapFeatureId: string): boolean {
  return mapFeatureToIoc(mapFeatureId) !== null;
}

export function iocToMapIso(iocCode: string): string | null {
  return IOC_TO_ISO[iocCode] ?? null;
}

export function getMapFeatureId(isoA3?: string, name?: string): string {
  if (isoA3 && isoA3 !== '-99') return isoA3;
  if (name && name in COUNTRY_NAME_TO_ISO) return COUNTRY_NAME_TO_ISO[name];
  if (name) return name.replace(/\s+/g, '-').toLowerCase();
  return '';
}

export function resolveMapFeatureFromProps(
  properties: Record<string, string | undefined>,
): string {
  return getMapFeatureId(
    properties.ISO_A3 ?? properties.iso_a3,
    properties.name ?? properties.NAME,
  );
}

export function resolveCountryId(isoA3?: string, _name?: string): string | null {
  if (isoA3 && isoA3 !== '-99') {
    const fromIso = mapFeatureToIoc(isoA3);
    if (fromIso) return fromIso;
  }
  return null;
}

export function getCountryId(isoA3: string, _name: string): string {
  return resolveCountryId(isoA3, _name) ?? isoA3;
}

export function getContinent(countryId: string): Continent {
  return IOC_BY_CODE[countryId]?.continent ?? 'asia';
}

const LEGACY_ID_TO_IOC: Record<string, string> = {
  ...ISO_TO_IOC,
  ENG: 'GBR',
  SCT: 'GBR',
  WLS: 'GBR',
  NIR: 'GBR',
};

export function migrateCountryId(legacyId: string): string {
  if (IOC_CODES.has(legacyId)) return legacyId;
  if (legacyId in LEGACY_ID_TO_IOC) return LEGACY_ID_TO_IOC[legacyId];
  if (isUkConstituent(legacyId)) return 'GBR';
  return legacyId;
}

export function isUkRegionVisited(
  regionId: UkRegion,
  ukRegions: UkRegion[] | undefined,
): boolean {
  if (!ukRegions || ukRegions.length === 0) return true;
  return ukRegions.includes(regionId);
}

export function isMapFeatureVisited(
  mapFeatureId: string,
  visits: { countryId: string; ukRegions?: UkRegion[] }[],
): boolean {
  const ioc = mapFeatureToIoc(mapFeatureId);
  if (!ioc) return false;
  const visit = visits.find((v) => v.countryId === ioc);
  if (!visit) return false;
  if (isUkConstituent(mapFeatureId)) {
    return isUkRegionVisited(mapFeatureId, visit.ukRegions);
  }
  return true;
}

export function mergeUkRegions(
  existing: UkRegion[] | undefined,
  incoming: UkRegion[] | undefined,
): UkRegion[] | undefined {
  if (!incoming || incoming.length === 0) return existing;
  const merged = new Set<UkRegion>([...(existing ?? []), ...incoming]);
  return [...merged];
}
