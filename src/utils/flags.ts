import { IOC_TO_ISO2 } from '@/data/iocCountries';

export function getFlagUrl(iocCode: string, width = 320): string | null {
  const iso2 = IOC_TO_ISO2[iocCode];
  if (!iso2) return null;
  return `https://flagcdn.com/w${width}/${iso2}.png`;
}
