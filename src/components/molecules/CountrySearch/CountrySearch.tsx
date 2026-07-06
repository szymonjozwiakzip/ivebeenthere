import { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '@/components/atoms/Input';
import type { UkRegion } from '@/types';
import { useVisitStore } from '@/store/visitStore';
import { iocToMapIso } from '@/data/countries';
import { searchCountries } from '@/utils/countrySearch';
import { resolveSearchSelection } from '@/data/countryAliases';
import styles from './CountrySearch.module.css';

interface CountrySearchProps {
  countryNames: Map<string, string>;
}

export function CountrySearch({ countryNames }: CountrySearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setSelectedCountry = useVisitStore((s) => s.setSelectedCountry);
  const isVisited = useVisitStore((s) => s.isVisited);

  const results = useMemo(
    () => searchCountries(query, countryNames),
    [query, countryNames],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCountry = (
    ioc: string,
    options?: { mapFeatureId?: string; ukRegions?: UkRegion[] },
  ) => {
    setSelectedCountry(ioc, {
      mapFeatureId: options?.mapFeatureId ?? iocToMapIso(ioc) ?? ioc,
      ukRegions: options?.ukRegions,
    });
    setQuery('');
    setOpen(false);
  };

  const handleSelect = (countryId: string) => {
    selectCountry(countryId);
  };

  const handleSubmit = () => {
    const resolved = resolveSearchSelection(query);
    if (resolved) {
      selectCountry(resolved.ioc, {
        mapFeatureId: resolved.mapFeatureId ?? iocToMapIso(resolved.ioc) ?? resolved.ioc,
        ukRegions: resolved.ukRegions,
      });
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <Input
        label="Szukaj kraju"
        placeholder="np. Polska, Wielka Brytania, Anglia…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
        autoComplete="off"
      />

      {open && query.trim() && (
        <ul className={styles.dropdown} role="listbox">
          {results.length === 0 ? (
            <li className={styles.noResults}>Brak wyników dla „{query}"</li>
          ) : (
            results.map(({ id, name }) => (
              <li key={id}>
                <button
                  type="button"
                  className={styles.option}
                  role="option"
                  onClick={() => handleSelect(id)}
                >
                  <span className={styles.optionName}>{name}</span>
                  {isVisited(id) && <span className={styles.visitedTag}>odwiedzony</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
