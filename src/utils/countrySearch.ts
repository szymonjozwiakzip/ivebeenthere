import { getPolishAliases, resolveAliasQuery } from '@/data/countryAliases';

export interface CountrySearchResult {
  id: string;
  name: string;
}

function scoreMatch(text: string, query: string): number {
  const t = text.toLowerCase();
  if (t === query) return 0;
  if (t.startsWith(query)) return 1;
  if (t.includes(query)) return 2;
  return 3;
}

export function searchCountries(
  query: string,
  countryNames: Map<string, string>,
  limit = 8,
): CountrySearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const seen = new Set<string>();
  const results: Array<CountrySearchResult & { score: number }> = [];

  const add = (id: string, score: number) => {
    if (seen.has(id) || !countryNames.has(id)) return;
    seen.add(id);
    results.push({ id, name: countryNames.get(id)!, score });
  };

  const exactAlias = resolveAliasQuery(q);
  if (exactAlias) add(exactAlias, 0);

  for (const [id, name] of countryNames) {
    const score = Math.min(
      scoreMatch(name, q),
      scoreMatch(id, q),
      ...getPolishAliases(id).map((alias) => scoreMatch(alias, q)),
    );
    if (score < 3) add(id, score);
  }

  return results
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.name.localeCompare(b.name, 'pl');
    })
    .slice(0, limit)
    .map(({ id, name }) => ({ id, name }));
}
