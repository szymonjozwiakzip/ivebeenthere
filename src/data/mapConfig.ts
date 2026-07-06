export const UK_CONSTITUENT_SOURCES = [
  {
    id: 'ENG',
    name: 'England',
    url: 'https://raw.githubusercontent.com/jhellingsdata/map-data/refs/heads/main/gbr/CTRY_GB-ENG.json',
  },
  {
    id: 'SCT',
    name: 'Scotland',
    url: 'https://raw.githubusercontent.com/jhellingsdata/map-data/refs/heads/main/gbr/CTRY_GB-SCT.json',
  },
  {
    id: 'WLS',
    name: 'Wales',
    url: 'https://raw.githubusercontent.com/jhellingsdata/map-data/refs/heads/main/gbr/CTRY_GB-WLS.json',
  },
  {
    id: 'NIR',
    name: 'Northern Ireland',
    url: 'https://raw.githubusercontent.com/jhellingsdata/map-data/refs/heads/main/gbr/CTRY_GB-NIR.json',
  },
] as const;

export const HIDDEN_MAP_COUNTRY_NAMES = new Set(['United Kingdom']);

export type MapFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  Record<string, string | undefined>
>;
