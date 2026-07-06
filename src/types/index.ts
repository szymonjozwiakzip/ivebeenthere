export type Continent =
  | 'africa'
  | 'asia'
  | 'europe'
  | 'north-america'
  | 'south-america'
  | 'oceania'
  | 'antarctica';

export type UkRegion = 'ENG' | 'SCT' | 'WLS' | 'NIR';

export interface CountryMeta {
  id: string;
  name: string;
  continent: Continent;
}

export interface Visit {
  countryId: string;
  ukRegions?: UkRegion[];
  year?: number;
  photo?: string;
}

export type ExportScope = 'world' | Continent;
export type ExportYearFilter = 'all' | number;

export interface ExportOptions {
  scope: ExportScope;
  yearFilter: ExportYearFilter;
  title: string;
  subtitle: string;
}

export interface ContinentStats {
  continent: Continent;
  visited: number;
  total: number;
  percentage: number;
}
