import type { MapViewScope } from '@/data/continentViews';
import { getContinent, mapFeatureToIoc } from '@/data/countries';

const COLORS = {
  land: '#b8c9dc',
  landHover: '#9eb4cf',
  visited: '#2563eb',
  visitedHover: '#1d4ed8',
  stroke: '#7a92ad',
  strokeSelected: '#1d4ed8',
  nonSelectable: '#d8e2ed',
};

export interface CountryMapStyle {
  fill: string;
  hoverFill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export function getCountryMapStyle(
  visited: boolean,
  isSelected: boolean,
): CountryMapStyle {
  if (visited) {
    return {
      fill: COLORS.visited,
      hoverFill: COLORS.visitedHover,
      stroke: isSelected ? COLORS.strokeSelected : COLORS.stroke,
      strokeWidth: isSelected ? 1.2 : 0.4,
      opacity: 1,
    };
  }

  return {
    fill: COLORS.land,
    hoverFill: COLORS.landHover,
    stroke: isSelected ? COLORS.strokeSelected : COLORS.stroke,
    strokeWidth: isSelected ? 1.2 : 0.55,
    opacity: 1,
  };
}

export function belongsToMapView(mapFeatureId: string, mapView: MapViewScope): boolean {
  if (mapView === 'world') return true;
  const ioc = mapFeatureToIoc(mapFeatureId);
  if (!ioc) return false;
  return getContinent(ioc) === mapView;
}
