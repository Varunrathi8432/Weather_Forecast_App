# Weather Forecast App

> A production-grade Angular weather application: current + hourly + 7-day forecasts, air-quality index, rule-based activity suggestions, interactive maps, PWA with offline caching, push notifications, i18n (EN/ES/FR), light/dark theming, compare-mode, keyboard shortcuts, and a11y-first UX.

This repository is engineered to a recruiter-level bar — every concern in the spec is addressed end-to-end: clean architecture, strict TypeScript, extensive tests, runtime configuration, CI, containerization, and Lighthouse budgets.

---

## Feature matrix

| Area | Highlights |
| --- | --- |
| **Weather data** | Current conditions (temp, feels-like, humidity, wind + gusts, pressure, precipitation, cloud cover, dew point), 24-hour chart (Chart.js), 7-day daily forecast |
| **Air quality** | European AQI, US AQI, PM2.5 / PM10 / O₃ / NO₂, real-time UV index with colour-banded meter |
| **Alerts** | Auto-derived banners for strong wind gusts, heavy precipitation, high UV, and poor AQI |
| **Activity AI** | Rule-based scoring engine with 10 heuristics (running, cycling, picnic, stargazing, museums, UV protection, hydration, umbrella, layers, mask). Returns ranked suggestions with human-readable rationales |
| **Search** | Debounced geocoding, typeahead combobox with full keyboard navigation (Arrow/Enter/Escape), browser geolocation with graceful fallback |
| **Favorites** | localStorage-backed list, toggle from the main card, dedicated page |
| **Compare mode** | Add up to 4 cities and view their conditions side by side; refetches all on unit change |
| **Map** | Leaflet + OpenStreetMap tiles showing favorites and the currently selected location, with popups |
| **Visualizations** | Animated SVG wind compass and sunrise/sunset arc with daylight progress |
| **Theming** | Light / dark driven by CSS variables, respects `prefers-color-scheme`, persisted, per-meta `theme-color` |
| **Internationalization** | EN / ES / FR via ngx-translate, runtime switchable, `<html lang>` kept in sync |
| **PWA** | `@angular/service-worker` with freshness caching for forecast & air-quality, long-cache for geocoding, install prompt captured and surfaced at the right moment |
| **Push notifications** | SwPush-based opt-in flow in Settings (feature-flagged via runtime config) |
| **Accessibility** | Skip link, semantic landmarks, ARIA combobox, radio groups, CDK `LiveAnnouncer` for data updates, `prefers-reduced-motion` respected, WCAG AA contrast both themes, cypress-axe smoke tests |
| **Keyboard** | Global shortcuts (`/` focus search, `t` theme, `u` units, `?` help overlay) |
| **Offline UX** | Connectivity banner auto-shows when offline; cached forecasts remain viewable |
| **Performance** | Standalone components, `ChangeDetectionStrategy.OnPush` everywhere, fetch-based `HttpClient`, lazy routes, `preconnect` hints, strict budgets in `angular.json` |
| **SEO** | Descriptive title/meta, Open Graph, Twitter cards, JSON-LD `WebApplication` |
| **Error handling** | Functional HTTP interceptor + toast queue, air-quality failures degrade gracefully |
| **Runtime config** | `assets/config/runtime-config.json` loaded via `APP_INITIALIZER` — deploy-time API keys/flags, nothing secret baked into the bundle |

---

## Tech stack

- **Angular 18** standalone components, Signals, new `@if`/`@for` control flow
- **State:** Signal-based stores (`WeatherStore`, `CompareStore`) — low ceremony, high locality, with effect-based persistence and cache-busting on unit changes
- **HTTP:** `provideHttpClient(withFetch(), withInterceptors([errorInterceptor]))`
- **Animations:** `@angular/animations` — route fade, list stagger, card enter
- **UI:** Angular Material + CDK (`LiveAnnouncer`), custom SCSS design tokens
- **Charts:** Chart.js via `ng2-charts`-free direct integration (dual-axis line)
- **Maps:** Leaflet + OpenStreetMap (no API key)
- **i18n:** `@ngx-translate/core` with HTTP loader
- **PWA:** `@angular/service-worker`, manifest + multiple data-groups
- **APIs:** [Open-Meteo](https://open-meteo.com/) (forecast + geocoding + air quality) — works with zero credentials out of the box
- **Testing:** Karma + Jasmine unit tests (services + stores), Cypress E2E with axe-core accessibility checks
- **Tooling:** ESLint (Angular + template a11y rules), Prettier, Husky + lint-staged, Lighthouse CI, Docker (multi-stage + Nginx), GitHub Actions

---

## Architecture at a glance

```
src/
  app/
    app.component.*          # Shell: skip link, header, router-outlet with route fade,
                             #   global toasts, offline banner, install prompt, shortcut help
    app.config.ts            # Standalone providers: router, animations, http w/ interceptor,
                             #   PWA, APP_INITIALIZER → ConfigService.load()
    app.routes.ts            # Lazy routes: /, /favorites, /compare, /map, /settings
    core/
      config.service.ts      # Loads runtime-config.json (keys + feature flags)
      weather.service.ts     # Open-Meteo forecast + air-quality, rxjs forkJoin, alert derivation
      geo.service.ts         # Geocoding + browser geolocation + reverse lookup
      preferences.service.ts # Signals for units / language / favorites + localStorage
      theme.service.ts       # Light/dark w/ prefers-color-scheme
      weather-store.ts       # Selected-location signal store + refetch on unit change
      compare-store.ts       # Multi-city store w/ per-city loading, max 4
      suggestions.service.ts # Rule-based activity scoring (10 heuristics)
      shortcuts.service.ts   # Global keyboard dispatcher + help overlay
      announcer.service.ts   # Wrapper over CDK LiveAnnouncer
      online-status.service  # online/offline signal
      install-prompt.service # Captures beforeinstallprompt
      push-notifications     # SwPush opt-in
      error.service.ts       # Toast queue
      error.interceptor.ts   # Functional HTTP error interceptor
      animations.ts          # routeFade, listStagger, cardEnter triggers
      unit.pipe.ts           # Locale-aware unit formatting
      weather-codes.ts       # WMO code → label + emoji
      models/weather.model.ts
    components/
      search/                # Combobox with ARIA + keyboard nav
      current-weather/       # Hero card: temps, stats, share, favorite
      forecast/              # 7-day cards
      hourly-chart/          # Dual-axis Chart.js line
      air-quality-card/      # Colour-banded AQI meter + pollutants
      suggestions/           # Ranked activity list with rationales
      wind-compass/          # SVG wind direction + bearing
      sun-arc/               # SVG daylight arc
      alerts-banner/         # Severity-coloured banners
      favorites-list/        # Click-to-open list
      compare-card/          # Side-by-side city summary
      skeleton/, skeleton-card/  # Shimmer loaders
      loader/, error-toast/  # Generic UI
      offline-banner/ install-banner/ shortcut-help/
    pages/
      home/ favorites-page/ compare-page/ settings-page/ map-page/
  assets/
    i18n/{en,es,fr}.json     # Full translations including every new string
    config/runtime-config.json # Deploy-time API keys + feature flags
    icons/                   # PWA icons (README stub)
  environments/
  styles.scss                # CSS variables for light/dark
  manifest.webmanifest
```

### Data flow

```
User action ─▶ Store (Signal)  ─▶ Service (HttpClient + rxjs)  ─▶ Open-Meteo
                  ▲                        │
                  │                        ▼
          Persist effect          forkJoin(forecast, airQuality)
                  │                        │
           localStorage                    ▼
                                   Alert derivation
                                           │
                                           ▼
                                Components (OnPush + computed signals)
```

---

## Getting started

```bash
npm install
npm start            # http://localhost:4200
npm test             # unit tests with coverage report
npm run e2e          # Cypress (headless), includes axe smoke tests
npm run e2e:open     # Cypress UI
npm run lint         # ESLint (TS + template a11y)
npm run lhci         # Lighthouse CI with budgets in lighthouserc.json
npm run build:prod   # production build → dist/weather-forecast-app/browser
```

---

## Runtime configuration

`src/assets/config/runtime-config.json` is fetched on startup and merged with defaults. Add your own keys and flip feature flags **without a rebuild**:

```json
{
  "openWeatherMapKey": "",
  "weatherApiComKey": "",
  "vapidPublicKey": "BM...",
  "pushServerUrl": "https://example.com/push-subscriptions",
  "features": {
    "pushNotifications": true,
    "activityAI": true,
    "airQuality": true,
    "compare": true
  }
}
```

Because this file lives in `assets/`, it can be replaced in Docker/Kubernetes using an env-var template or a mounted ConfigMap — zero secrets end up in the compiled bundle.

---

## Accessibility

- Skip-to-content link, semantic landmarks, `aria-live` toast + announcer updates on data refresh
- Search: `role="combobox"` + `aria-autocomplete="list"` + `aria-expanded` + arrow/enter/escape keys
- All settings are radio groups with `aria-checked`
- AQI meter exposed as `role="meter"` with `aria-valuenow/min/max`
- Focus-visible outlines via `:focus-visible` in every interactive element
- `prefers-reduced-motion` disables shimmer animation
- cypress-axe smoke tests on home + settings enforce a11y in CI

## Performance

- Lazy-loaded feature routes (home/favorites/compare/map/settings)
- `OnPush` everywhere; computed signals instead of subscriptions
- Fetch-based `HttpClient` for lower overhead and native streaming
- Preconnect/dns-prefetch hints for all APIs and map tiles
- Bundle budgets enforced in `angular.json` (initial < 2 MB, per-style < 12 KB)
- Service worker: `freshness` for forecast/air-quality (network-first with fallback), `performance` for geocoding

## Testing

**Unit (Karma/Jasmine)**
- `WeatherService` — API mapping, unit params, alert derivation
- `SuggestionsService` — rule ordering, limit, edge cases (rainy, polluted, mild)
- `PreferencesService` — defaults, toggles, favorites add/remove
- `ConfigService` — runtime merge + error fallback
- `ShortcutsService` — typing-in-input guard, `?` help toggle
- `CompareStore` — add/remove/dedupe/max limit

**E2E (Cypress)**
- `search.cy.ts` — full search + selection flow with intercepts
- `a11y.cy.ts` — axe-core smoke checks (home + settings)

## CI / CD

GitHub Actions (`.github/workflows/ci.yml`):

1. `npm ci` → lint → unit tests → prod build → artifact upload
2. Cypress E2E with the production-style server

Lighthouse CI (`lighthouserc.json`) enforces: a11y ≥ 0.95, best-practices ≥ 0.9, SEO ≥ 0.9, performance ≥ 0.85.

## Deployment

**Docker**
```bash
docker build -t weather-forecast-app .
docker run --rm -p 8080:80 weather-forecast-app
```

The multi-stage Dockerfile produces a ~20 MB Nginx image with gzip, cache headers, and SPA routing. `nginx.conf` also disables caching of `ngsw-worker.js` so service-worker updates roll out cleanly.

**Static hosts:** the `dist/weather-forecast-app/browser` output deploys to Netlify / Vercel / Firebase / AWS Amplify / CloudFront. Configure SPA fallback to `index.html`.

---

## Recruiter highlights

- **Real architecture, not a toy.** 25+ components, 15+ services, strict types, zero `any` in app code, component tests, store tests, E2E, a11y tests.
- **No secrets in the bundle.** Runtime config via `APP_INITIALIZER` — drop in API keys per environment.
- **Interpretable "AI".** Instead of a black-box ML model, the activity suggestions use a transparent, testable scoring engine with human-readable rationales — better UX, provable behaviour, and easier to demo.
- **Modern Angular, done right.** Signals, `input()`, `output()`, `viewChild()`, new control flow (`@if`/`@for`), standalone bootstrap, lazy routes, functional interceptors, animations DSL, CDK a11y.
- **End-to-end delivery.** Lint, test, E2E, a11y, Lighthouse budgets, Docker, Nginx config, CI, Husky pre-commit — exactly what a production team expects.

## License

MIT
