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

## GitHub Pages

Aplikacja jest publikowana pod:

**https://szymonjozwiakzip.github.io/ivebeenthere/**

### Lokalny build jak na Pages

```bash
npm run build:pages
npm run preview:pages
```

### Deploy

1. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push na `main` uruchamia workflow `.github/workflows/deploy-pages.yml`.

Lokalny dev (`npm run dev`) używa `base: /`. Build Pages ustawia `VITE_BASE_PATH=/ivebeenthere/`.

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
