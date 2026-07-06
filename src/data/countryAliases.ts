import type { UkRegion } from '@/types';

/** Polskie nazwy → kod MKOl */
export const COUNTRY_POLISH_ALIASES: Record<string, string> = {
  polska: 'POL',
  niemcy: 'GER',
  francja: 'FRA',
  włochy: 'ITA',
  wlochy: 'ITA',
  hiszpania: 'ESP',
  wielka: 'GBR',
  brytania: 'GBR',
  'wielka brytania': 'GBR',
  monako: 'MON',
  watykan: 'VAT',
  andora: 'AND',
  malta: 'MLT',
  'san marino': 'SMR',
  liechtenstein: 'LIE',
  usa: 'USA',
  stany: 'USA',
  ameryka: 'USA',
  kanada: 'CAN',
  meksyk: 'MEX',
  brazylia: 'BRA',
  argentyna: 'ARG',
  chile: 'CHI',
  japonia: 'JPN',
  chiny: 'CHN',
  indie: 'IND',
  rosja: 'RUS',
  ukraina: 'UKR',
  czechy: 'CZE',
  slowacja: 'SVK',
  słowacja: 'SVK',
  slowenia: 'SLO',
  słowenia: 'SLO',
  austria: 'AUT',
  szwajcaria: 'SUI',
  belgia: 'BEL',
  holandia: 'NED',
  niderlandy: 'NED',
  norwegia: 'NOR',
  szwecja: 'SWE',
  finlandia: 'FIN',
  dania: 'DEN',
  islandia: 'ISL',
  irlandia: 'IRL',
  portugalia: 'POR',
  grecja: 'GRE',
  turcja: 'TUR',
  egipt: 'EGY',
  maroko: 'MAR',
  rpa: 'RSA',
  australia: 'AUS',
  zelandia: 'NZL',
  tajlandia: 'THA',
  wietnam: 'VIE',
  korea: 'KOR',
  izrael: 'ISR',
  emiraty: 'UAE',
  singapur: 'SGP',
  malezja: 'MAS',
  indonezja: 'INA',
  filipiny: 'PHI',
  rumunia: 'ROU',
  bulgaria: 'BUL',
  bułgaria: 'BUL',
  wegry: 'HUN',
  węgry: 'HUN',
  chorwacja: 'CRO',
  serbia: 'SRB',
  bośnia: 'BIH',
  bosnia: 'BIH',
  czarnogora: 'MNE',
  czarnogóra: 'MNE',
  albania: 'ALB',
  macedonia: 'MKD',
  moldawia: 'MDA',
  mołdawia: 'MDA',
  bialorus: 'BLR',
  białoruś: 'BLR',
  litwa: 'LTU',
  lotwa: 'LAT',
  łotwa: 'LAT',
  estonia: 'EST',
  gruzja: 'GEO',
  armenia: 'ARM',
  azerbejdzan: 'AZE',
  azerbejdżan: 'AZE',
  kazachstan: 'KAZ',
  portoryko: 'PUR',
  tajwan: 'TPE',
  kosowo: 'KOS',
};

/** Alias regionu UK → część Wielkiej Brytanii */
export const UK_REGION_ALIASES: Record<string, UkRegion> = {
  anglia: 'ENG',
  england: 'ENG',
  szkocja: 'SCT',
  scotland: 'SCT',
  walia: 'WLS',
  wales: 'WLS',
  'irlandia północna': 'NIR',
  'northern ireland': 'NIR',
};

export interface SearchSelection {
  ioc: string;
  mapFeatureId?: string;
  ukRegions?: UkRegion[];
}

const aliasesByIoc = new Map<string, string[]>();
for (const [alias, ioc] of Object.entries(COUNTRY_POLISH_ALIASES)) {
  const list = aliasesByIoc.get(ioc) ?? [];
  list.push(alias);
  aliasesByIoc.set(ioc, list);
}

export function getPolishAliases(ioc: string): string[] {
  return aliasesByIoc.get(ioc) ?? [];
}

export function resolveSearchSelection(query: string): SearchSelection | null {
  const q = query.trim().toLowerCase();
  const ukRegion = UK_REGION_ALIASES[q];
  if (ukRegion) {
    return { ioc: 'GBR', mapFeatureId: ukRegion, ukRegions: [ukRegion] };
  }
  const ioc = COUNTRY_POLISH_ALIASES[q];
  if (ioc) return { ioc };
  return null;
}

export function resolveAliasQuery(query: string): string | null {
  return resolveSearchSelection(query)?.ioc ?? null;
}
