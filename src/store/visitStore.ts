import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UkRegion, Visit } from '@/types';
import { STORAGE_KEY } from '@/data/constants';
import {
  isUkConstituent,
  mergeUkRegions,
  migrateCountryId,
} from '@/data/countries';
import { IOC_CODES } from '@/data/iocCountries';

export interface SelectionDraft {
  year?: number;
  photo?: string;
  ukRegions?: UkRegion[];
}

interface SelectCountryOptions {
  mapFeatureId?: string;
  ukRegions?: UkRegion[];
}

interface VisitState {
  visits: Visit[];
  selectedCountryId: string | null;
  selectedMapFeatureId: string | null;
  selectionDraft: SelectionDraft;
  setSelectedCountry: (id: string | null, options?: SelectCountryOptions) => void;
  setSelectionDraft: (draft: Partial<SelectionDraft>) => void;
  addVisit: (countryId: string, data?: SelectionDraft) => void;
  removeVisit: (countryId: string) => void;
  setVisitYear: (countryId: string, year?: number) => void;
  setVisitPhoto: (countryId: string, photo?: string) => void;
  getVisit: (countryId: string) => Visit | undefined;
  isVisited: (countryId: string) => boolean;
}

function migrateVisits(visits: Visit[]): Visit[] {
  const byIoc = new Map<string, Visit>();

  for (const raw of visits) {
    const countryId = migrateCountryId(raw.countryId);
    if (!IOC_CODES.has(countryId)) continue;

    let ukRegions = raw.ukRegions;
    if (countryId === 'GBR' && isUkConstituent(raw.countryId)) {
      ukRegions = mergeUkRegions(ukRegions, [raw.countryId]);
    }

    const existing = byIoc.get(countryId);
    if (!existing) {
      byIoc.set(countryId, {
        countryId,
        year: raw.year,
        photo: raw.photo,
        ukRegions,
      });
      continue;
    }

    byIoc.set(countryId, {
      countryId,
      year: raw.year ?? existing.year,
      photo: raw.photo ?? existing.photo,
      ukRegions:
        countryId === 'GBR'
          ? mergeUkRegions(existing.ukRegions, ukRegions)
          : existing.ukRegions,
    });
  }

  return Array.from(byIoc.values());
}

export const useVisitStore = create<VisitState>()(
  persist(
    (set, get) => ({
      visits: [],
      selectedCountryId: null,
      selectedMapFeatureId: null,
      selectionDraft: {},

      setSelectedCountry: (id, options) => {
        if (!id) {
          set({ selectedCountryId: null, selectedMapFeatureId: null, selectionDraft: {} });
          return;
        }

        const countryId = migrateCountryId(id);
        const visit = get().visits.find((v) => v.countryId === countryId);
        const ukRegions =
          options?.ukRegions ??
          (countryId === 'GBR' && isUkConstituent(id) ? [id] : undefined);

        set({
          selectedCountryId: countryId,
          selectedMapFeatureId: options?.mapFeatureId ?? id,
          selectionDraft: visit
            ? {
                year: visit.year,
                photo: visit.photo,
                ukRegions: visit.ukRegions,
              }
            : ukRegions
              ? { ukRegions }
              : {},
        });
      },

      setSelectionDraft: (draft) =>
        set((state) => ({
          selectionDraft: { ...state.selectionDraft, ...draft },
        })),

      addVisit: (countryId, data) =>
        set((state) => {
          const canonicalId = migrateCountryId(countryId);
          const payload = data ?? state.selectionDraft;
          const existing = state.visits.find((v) => v.countryId === canonicalId);

          if (existing) {
            return {
              visits: state.visits.map((v) =>
                v.countryId === canonicalId
                  ? {
                      ...v,
                      year: payload.year ?? v.year,
                      photo: payload.photo ?? v.photo,
                      ukRegions:
                        canonicalId === 'GBR'
                          ? mergeUkRegions(v.ukRegions, payload.ukRegions)
                          : v.ukRegions,
                    }
                  : v,
              ),
              selectionDraft: {
                year: payload.year ?? existing.year,
                photo: payload.photo ?? existing.photo,
                ukRegions:
                  canonicalId === 'GBR'
                    ? mergeUkRegions(existing.ukRegions, payload.ukRegions)
                    : existing.ukRegions,
              },
            };
          }

          return {
            visits: [
              ...state.visits,
              {
                countryId: canonicalId,
                year: payload.year,
                photo: payload.photo,
                ukRegions: canonicalId === 'GBR' ? payload.ukRegions : undefined,
              },
            ],
            selectionDraft: {
              year: payload.year,
              photo: payload.photo,
              ukRegions: canonicalId === 'GBR' ? payload.ukRegions : undefined,
            },
          };
        }),

      removeVisit: (countryId) =>
        set((state) => {
          const canonicalId = migrateCountryId(countryId);
          return {
            visits: state.visits.filter((v) => v.countryId !== canonicalId),
            selectionDraft: {},
            selectedCountryId:
              state.selectedCountryId === canonicalId ? null : state.selectedCountryId,
            selectedMapFeatureId:
              state.selectedCountryId === canonicalId ? null : state.selectedMapFeatureId,
          };
        }),

      setVisitYear: (countryId, year) =>
        set((state) => {
          const canonicalId = migrateCountryId(countryId);
          return {
            visits: state.visits.map((v) =>
              v.countryId === canonicalId ? { ...v, year } : v,
            ),
            selectionDraft: { ...state.selectionDraft, year },
          };
        }),

      setVisitPhoto: (countryId, photo) =>
        set((state) => {
          const canonicalId = migrateCountryId(countryId);
          return {
            visits: state.visits.map((v) =>
              v.countryId === canonicalId ? { ...v, photo } : v,
            ),
            selectionDraft: { ...state.selectionDraft, photo },
          };
        }),

      getVisit: (countryId) => {
        const canonicalId = migrateCountryId(countryId);
        return get().visits.find((v) => v.countryId === canonicalId);
      },

      isVisited: (countryId) => {
        const canonicalId = migrateCountryId(countryId);
        return get().visits.some((v) => v.countryId === canonicalId);
      },
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      migrate: (persisted, version) => {
        const state = persisted as { visits?: Visit[] };
        if (state.visits && version < 3) {
          return { ...state, visits: migrateVisits(state.visits) };
        }
        return state as VisitState;
      },
      partialize: (state) => ({
        visits: state.visits,
      }),
    },
  ),
);
