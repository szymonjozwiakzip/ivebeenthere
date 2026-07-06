import type { Continent } from '@/types';

export type MapViewScope = 'world' | Continent;

export interface MapViewConfig {
  label: string;
  projection: 'geoMercator' | 'geoEqualEarth' | 'geoAzimuthalEqualArea';
  scale: number;
  center: [number, number];
  defaultZoom: number;
}

export const MAP_VIEW_CONFIGS: Record<MapViewScope, MapViewConfig> = {
  world: {
    label: 'Świat',
    projection: 'geoEqualEarth',
    scale: 160,
    center: [0, 0],
    defaultZoom: 1,
  },
  europe: {
    label: 'Europa',
    projection: 'geoAzimuthalEqualArea',
    scale: 900,
    center: [15, 52],
    defaultZoom: 1,
  },
  asia: {
    label: 'Azja',
    projection: 'geoMercator',
    scale: 320,
    center: [95, 30],
    defaultZoom: 1,
  },
  africa: {
    label: 'Afryka',
    projection: 'geoMercator',
    scale: 380,
    center: [20, 2],
    defaultZoom: 1,
  },
  'north-america': {
    label: 'Ameryka Północna',
    projection: 'geoMercator',
    scale: 320,
    center: [-100, 48],
    defaultZoom: 1,
  },
  'south-america': {
    label: 'Ameryka Południowa',
    projection: 'geoMercator',
    scale: 420,
    center: [-58, -15],
    defaultZoom: 1,
  },
  oceania: {
    label: 'Oceania',
    projection: 'geoMercator',
    scale: 520,
    center: [145, -22],
    defaultZoom: 1,
  },
  antarctica: {
    label: 'Antarktyda',
    projection: 'geoMercator',
    scale: 280,
    center: [0, -78],
    defaultZoom: 1,
  },
};

export const MAP_VIEW_ORDER: MapViewScope[] = [
  'world',
  'europe',
  'asia',
  'africa',
  'north-america',
  'south-america',
  'oceania',
];
