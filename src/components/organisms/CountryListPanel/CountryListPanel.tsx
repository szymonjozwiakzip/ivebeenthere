import { useMemo, useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { CONTINENT_LABELS, CONTINENT_ORDER } from '@/data/constants';
import { useVisitStore } from '@/store/visitStore';
import { searchCountries } from '@/utils/countrySearch';
import { buildCountryList, getListCountryIds, groupCountriesByContinent } from '@/utils/countryList';
import styles from './CountryListPanel.module.css';

type VisitFilter = 'all' | 'visited' | 'unvisited';

interface CountryListPanelProps {
  countryNames: Map<string, string>;
  onSelectCountry?: (countryId: string) => void;
}

export function CountryListPanel({ countryNames, onSelectCountry }: CountryListPanelProps) {
  const isVisited = useVisitStore((s) => s.isVisited);
  const [query, setQuery] = useState('');
  const [visitFilter, setVisitFilter] = useState<VisitFilter>('all');

  const totalCountries = getListCountryIds().length;

  const filteredCountries = useMemo(() => {
    const all = buildCountryList(countryNames);
    const q = query.trim();

    let list = q
      ? searchCountries(q, countryNames, 500).map(({ id, name }) => {
          const entry = all.find((c) => c.id === id);
          return entry ?? { id, name, continent: all.find((c) => c.id === id)?.continent ?? 'asia' };
        })
      : all;

    if (visitFilter === 'visited') {
      list = list.filter((c) => isVisited(c.id));
    } else if (visitFilter === 'unvisited') {
      list = list.filter((c) => !isVisited(c.id));
    }

    return list;
  }, [countryNames, query, visitFilter, isVisited]);

  const grouped = useMemo(() => {
    const groups = groupCountriesByContinent(filteredCountries);
    for (const continent of CONTINENT_ORDER) {
      if (!groups.has(continent)) groups.set(continent, []);
    }
    return groups;
  }, [filteredCountries]);

  const visitedCount = useMemo(
    () => getListCountryIds().filter((id) => isVisited(id)).length,
    [isVisited],
  );

  return (
    <section className={styles.panel} aria-label="Lista krajów">
      <div>
        <h2 className={styles.heading}>Lista krajów</h2>
        <p className={styles.summary}>
          {visitedCount} odwiedzonych z {totalCountries}
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Input
            label="Filtruj listę"
            placeholder="np. Polska, Portoryko, Wielka Brytania…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className={styles.filters} role="group" aria-label="Filtr odwiedzin">
          {([
            ['all', 'Wszystkie'],
            ['visited', 'Odwiedzone'],
            ['unvisited', 'Nieodwiedzone'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`${styles.filterBtn} ${visitFilter === id ? styles.filterBtnActive : ''}`}
              onClick={() => setVisitFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredCountries.length === 0 ? (
        <p className={styles.empty}>Brak krajów pasujących do filtra.</p>
      ) : (
        <div className={styles.sections}>
          {CONTINENT_ORDER.filter((c) => c !== 'antarctica')
            .map((continent) => {
              const countries = grouped.get(continent) ?? [];
              if (countries.length === 0) return null;
              return (
                <section key={continent} className={styles.continentSection}>
                  <h3 className={styles.continentHeader}>
                    <span className={styles.continentName}>{CONTINENT_LABELS[continent]}</span>
                    <span className={styles.continentCount}>{countries.length}</span>
                  </h3>
                  <ul className={styles.list}>
                    {countries.map((country) => {
                      const visited = isVisited(country.id);
                      return (
                        <li key={country.id}>
                          <button
                            type="button"
                            className={`${styles.row} ${visited ? styles.rowVisited : ''}`}
                            onClick={() => onSelectCountry?.(country.id)}
                            title={onSelectCountry ? 'Pokaż na mapie' : undefined}
                          >
                            <span className={styles.rowName}>{country.name}</span>
                            <span className={styles.rowCode}>{country.id}</span>
                            {visited && <span className={styles.visitedDot} aria-label="Odwiedzony" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
        </div>
      )}
    </section>
  );
}
