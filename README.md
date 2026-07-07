# I've been there

Interaktywna aplikacja do śledzenia odwiedzonych krajów na mapie świata.

## Funkcje

- Zaznaczanie krajów na interaktywnej mapie 2D
- Opcjonalny rok wizyty
- Zdjęcia przypisane do krajów (upload z komputera)
- Statystyki per kontynent z procentowym udziałem
- Eksport mapy jako PNG lub PDF z tytułem, podtytułem i filtrem (kontynent/świat, rok/all time)
- Dane zapisywane lokalnie w przeglądarce (localStorage)

## Uruchomienie

```bash
npm install
npm run dev
```

## Stack

- React 18 + TypeScript
- Vite
- react-simple-maps (mapa świata)
- Zustand (stan + persist)
- html2canvas + jsPDF (eksport)

## Architektura

Komponenty podzielone według atomic design:

- `atoms/` — Button, Input, Select, Badge, RotatingGlobe, ProgressBar
- `molecules/` — ContinentStatCard, PhotoUpload, YearInput, WorldSummary
- `organisms/` — AppHeader, WorldMap, CountryPanel, StatsPanel, ExportPanel
