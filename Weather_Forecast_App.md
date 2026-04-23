# Executive Summary  
This report defines a comprehensive, recruiter‑impressive Angular weather app prompt by outlining clear goals, modern features, recommended technologies, API choices, architecture, and delivery.  The **goals** include showcasing full-stack frontend skills, production‑ready quality (performance, accessibility, security), robust testing, and end‑to‑end deployment (CI/CD, live demo).  **Key features** span current weather, multi‑day/hour forecasts, geolocation, search, favourites, PWA offline support, theming, charts, maps, and internationalization.  We recommend the **latest Angular** (v21+) with RxJS and a state store (NgRx or Angular Signals), Angular Material (or Tailwind) UI, ngx‑translate (or built‑in i18n), Chart.js (ng2‑charts) or D3 for graphs, and Leaflet/Mapbox for maps.  APIs include OpenWeatherMap, WeatherAPI.com, and Meteostat (with Auth and rate limits) – a comparison table is provided.  The architecture uses Angular modules, services, and NgRx for data flow, with lazy‑loaded routes, service workers for caching, and CLI‑generated code.  We emphasise performance optimisations (lazy loading, zone‑less change detection, image optimization) and accessibility (ARIA, keyboard support) per Angular best practices【27†L121-L127】【25†L149-L157】.  **Testing** uses Jest/Karma for units and Cypress for end‑to‑end.  **CI/CD** involves automated builds/tests (e.g. GitHub Actions) and hosting on Netlify/Vercel/AWS Amplify (free tiers for personal projects)【59†L7-L15】.  Deliverables include a clean code structure, README, live demo URL, test suite, Dockerfile/deployment scripts.  **Recruiters** will evaluate project completeness, code quality, performance (Lighthouse), responsiveness, a11y compliance, testing, and documentation【53†L72-L80】【53†L103-L112】.  Optional advanced prompts (ML forecasts, WebSockets, serverless) are also discussed.  Tables compare weather APIs, key libraries, hosting options, and a component breakdown.  Finally, suggested AI sub‑prompts guide code generation for critical parts. 

## Goals and Requirements  
- **Showcase Skills:** Demonstrate expertise in **modern Angular (v21+) development**, including CLI usage, TypeScript, RxJS, Ng modules, and Angular Material or Tailwind styling. Recruiters expect a project showing both breadth and depth – i.e. a complex, polished app with clear business logic【53†L157-L166】.  
- **Production Readiness:** Ensure *performance*, *accessibility*, and *security* are first-class. Include PWA offline support and responsive design. Aim for good Lighthouse metrics【53†L103-L112】. Follow Angular best practices for PWAs【23†L151-L160】, accessibility (use ARIA, semantic HTML, keyboard navigation)【25†L149-L157】, and security (sanitise data, use AOT)【29†L125-L133】.  
- **Performance:** Use lazy-loading, optimize images, and leverage Angular’s built-in performance tools (e.g. zone‑less change detection, `OnPush`, `<img ngOptimized>` for images)【27†L121-L127】.  
- **Accessibility:** Comply with WCAG basics: alt text, proper headings, contrast, focus styles, etc. Use Angular Material/CDK which are accessible by design【25†L149-L157】 and aria attributes. Provide full keyboard support (Tab/Enter/Arrows)【49†L7-L10】.  
- **Testing:** Include thorough *unit tests* (Jest or Jasmine/Karma) for components and services, and *end-to-end tests* (Cypress) covering critical flows (search, API failure, offline). Maintain high code coverage and use mocks for external APIs.  
- **CI/CD & Deployment:** Automate build/test/deploy via GitHub Actions (or similar) on push. Deploy the app to a public host (e.g. Netlify/Vercel/AWS) with HTTPS and continuous delivery. Ensure a live demo link is accessible – recruiters expect to *click and use* your project【53†L72-L80】.  
- **Documentation:** Provide a clear README describing the app’s purpose, features, tech stack, setup instructions, and demo link. Include comments in code and a CHANGELOG or commit history demonstrating thoughtfulness.

## Required Features  
The app should support:  
- **Current Weather:** Show real-time conditions (temperature, icon, humidity, wind, etc.) for the user’s location (via geolocation API) and searched cities.  
- **7-Day Forecast:** Daily high/low temps and conditions for the next week.  
- **Hourly Forecast:** At least 24‑hour or 48‑hour breakdown. Possibly interactive timeline.  
- **Geolocation:** Auto-detect user location (HTML5 Geolocation) with permission fallback to manual search.  
- **Search & Favourites:** Text search for city names (with autocomplete) and ability to save favorite locations. Store favorites in localStorage or state.  
- **Unit Conversion:** Toggle between Metric/Imperial for temperature, wind, precipitation, etc. Persist choice.  
- **Interactive Charts:** Graphs for temperature trends (line chart), precipitation probability, etc. (e.g. with Chart.js/ng2-charts or D3) to visualise forecast data.  
- **Map Display:** Optional map view of weather for a location or multiple saved cities using Leaflet or Mapbox. Could also show weather alerts/heatmap layers.  
- **Localization (i18n):** Support multiple languages (e.g. en + one or two locales) using ngx-translate or Angular’s i18n. All text (UI labels, error messages) should translate.  
- **Theming:** Implement light/dark mode toggle, with CSS custom properties or Material theming. Persist user theme choice.  
- **Animations & UX:** Add smooth animations (Angular Animations or CSS) for loading states, transitions between weather cards, and interactive elements. Use skeleton loaders or spinners during data fetch.  
- **Error Handling:** Gracefully handle API failures (show user-friendly messages). Validate user input. Use Angular’s error interceptor or try/catch.  
- **Offline Support:** Make the app a PWA via Angular’s service worker. Cache assets and recent API data, so the app is usable offline (at least showing cached weather). Provide feedback when offline.  

## Technology Stack Suggestions  

- **Angular Version:** Use latest stable (v21+). Leverage Angular CLI, Ivy, and ng update for smooth dev experience.  
- **State Management:** Use NgRx (Redux-style) for global state (weather data, user prefs, favorites) or Angular Signals/Signal Store for simpler state if using v21【55†L87-L94】. NgRx Effects can manage API calls and side effects. Alternatively, lighter libraries like Akita or NGXS are acceptable.  
- **UI Library:** **Angular Material** (components and theming) is recommended; it’s well-tested and fully accessible【25†L149-L157】. Tailwind CSS (with Angular) is another option for custom design. Either approach should use responsive, mobile-first design.  
- **Styling:** SCSS/CSS Modules with a utility framework (Tailwind) or Material Theming. Use CSS Grid/Flexbox for layout. Ensure responsiveness (e.g. breakpoints at mobile/tablet/desktop).  
- **Localization:** Use ngx-translate or Transloco for runtime i18n. (Angular built-in i18n is compile-time per locale; mention but opt for ngx-translate for ease of demos.) Load translation JSONs.  
- **Charts:** **Chart.js** (via `ng2-charts`) for straightforward bar/line charts, or **D3.js** for more complex/custom visuals. Chart.js has simpler API and wide use; D3 allows fully custom graphs. Cite Angular dev using Chart.js is common.  
- **Maps:** **Leaflet** (open-source) for mapping with ngx-leaflet. Alternatively, Mapbox GL JS for vector tiles (requires API key). Google Maps API is possible but needs billing. Leaflet+OpenStreetMap is free and easy.  
- **PWA:** Use `@angular/pwa` (Angular service worker). Leverage the built-in SW (caching, ngsw.json). Web Manifest for installability. For guidance: Angular’s PWA docs【23†L151-L160】.  
- **Animations:** Use `@angular/animations` (Angular Animation DSL) for state transitions. For more elaborate effects, could include Lottie (bodymovin) or GreenSock (GSAP) if desired.  
- **API Integration:** Use Angular `HttpClient` with RxJS for asynchronous calls. Implement services that call the chosen weather APIs. Handle JSON and errors.  
- **Testing Frameworks:** Jest (with jest-preset-angular) or Karma/Jasmine for unit tests. Cypress for end-to-end tests (simulate search, navigation, offline behavior). Use TestBed for component tests, mocking Http calls.  
- **Tools/Linters:** ESLint (with Angular plugin) for code style. Prettier for formatting. Commit lint or husky for pre‑commit checks.  

## Weather Data APIs  

| API             | Free Tier / Rate Limits                     | Data (Coverage)                                                 | Auth & Notes                                                     |
|-----------------|---------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------|
| **OpenWeatherMap** (OWM)【9†L392-L399】 | Free: up to **60 calls/min** and **1,000,000 calls/month**【9†L392-L399】 (current weather, forecasts). Paid tiers for extended forecasts. | Current weather (temp, humidity, wind, pressure, conditions), 5-day/3h forecast, 16-day forecast, UV, air pollution. Multilingual support and unit switching available. | Requires API key in query. Use One Call API or separate endpoints. Note built-in geocoding (deprecated; use Geocoding API).  |
| **WeatherAPI.com**【38†L299-L307】 | Free: **1,000,000 calls/month** with 3-day forecast; Paid: from $7/mo (3M calls) up【38†L299-L307】. | Current weather, hourly/daily forecast, historical data, air quality, astronomy. 15-min intervals. Multi-language support. | API key required. Well-documented JSON API. Limits calls/hour/day by plan.  |
| **Meteostat (RapidAPI)**【43†L65-L69】 | Free: **500 requests/month**【43†L65-L69】. Paid plans for more. Provides climate data. | Historical weather: hourly and daily observations (temp, wind, precipitation, etc.) derived from stations and models. Better for past data analytics. | Access via RapidAPI; requires X-RapidAPI-Key header. JSON API endpoints. Focus on historical/archival data rather than forecasts. |
| **Open-Meteo**【40†L429-L433】 | Free: unlimited for non-commercial use (Fair Use: ~10k/day)【9†L350-L359】【40†L429-L433】. | Current conditions, forecasts (hourly, daily) based on global models. Includes solar, wind, climate normals. Supports many regions. | No API key needed. REST JSON endpoints. Good for quick, free access. Recommended as backup/free alternative. |
| (Optional) **Weatherbit**, **Visual Crossing**, etc. | Many offer free tiers (1000/day) and moderate paid plans【36†L246-L254】. | Provides similar data (some with global coverage, air quality). | Could be listed as alternatives; rapidapi lists many.  |

*(See table above for a feature/rate comparison. Free tiers allow up to ~1M monthly calls for OWM/WeatherAPI, but Meteostat is very limited free.)*  

## Data Flow and Architecture  

- **Modular Design:** Split the app into logical Angular modules (e.g. CoreModule for singleton services, SharedModule for common components, WeatherModule for feature components). Use Angular’s CLI generated structure.  
- **Components:** Break UI into focused components (table below). Use Presentational (dumb) vs Container (smart) pattern where containers retrieve data and pass to child components.  
- **Services:** Create `WeatherService` (or API service) that fetches data from chosen APIs via HttpClient. Possibly separate services (e.g. `GeoService` for geolocation). Use RxJS Observables for async flows.  
- **State Management:** Manage weather data, forecasts, user preferences (units, theme, language, favorites) in a global store. With **NgRx**: define actions (e.g. LOAD_WEATHER, LOAD_SUCCESS, LOAD_FAIL), reducers, selectors, and Effects for API calls. State is persisted (e.g. favorites) with localStorage. Alternatively, use the new Signal Store (Angular Signals) for simpler state with built-in reactivity【55†L87-L94】.  
- **Routing:** Use Angular Router with lazy-loaded routes for major sections (e.g. `/home`, `/favorites`, `/settings`). Lazy loading reduces initial bundle size【27†L121-L127】.  
- **Service Worker (PWA):** Configure `ngsw-config.json` to cache app shell and API responses (as needed). Follow Angular guidelines: the SW caches the entire app and serves old version until update【23†L153-L160】, so update strategy is safe. Provide “Update available” prompt via `SwUpdate`.  
- **Offline Caching:** Use Angular SW to cache assets and chosen API JSON (cache-first strategy). Implement a custom data caching strategy if needed (e.g. Cache API or IndexedDB via LocalForage) for recent API results.  
- **Error and Loading States:** Globally intercept HTTP errors to show notifications. Use an `HttpInterceptor` or wrap RxJS with `catchError`. Show loading spinners or skeletons while data is fetched.  

## Performance Considerations  

- **Lazy Loading:** Implement lazy-loaded feature modules for routes to minimise initial bundle【27†L121-L127】.  
- **Change Detection:** Use `ChangeDetectionStrategy.OnPush` and Angular Signals/Observables to reduce unnecessary checks. Angular v21’s zone-less change detection can further improve responsiveness.  
- **Image Optimization:** Use `<img ngOptimized>` (Angular’s image directive) or manually add `srcset` for responsive images. Lazy-load non-critical images. Compress icons/graphics.  
- **Bundle Size:** Remove unused code, use Angular CLI’s production build (`ng build --prod`). Consider using `@defer` or dynamic imports for heavy components.  
- **Server-Side Rendering (Optional):** For SEO or faster first-paint, consider Angular Universal. This is beyond “frontend only”, so optional unless SEO is a goal. (Citing performance guide: use SSR to improve initial LCP【27†L125-L133】.)  
- **Metrics:** Continuously profile with Chrome DevTools/Angular DevTools. Ensure core web vitals are reasonable (avoid >3s load). Recruiters check load time【53†L103-L112】.  

## Accessibility (A11y)  

- Use **Angular Material/CDK**: its components (buttons, dialogs, tabs, etc.) have built‑in ARIA and keyboard support【25†L149-L157】.  
- **Semantic HTML:** Prefer native elements (`<button>`, `<form>`, `<input>`) to custom tags. Use proper headings (`<h1>`, `<h2>`) structure.  
- **ARIA Attributes:** Add labels and roles where necessary (e.g. `<button aria-label="Toggle theme">`). Use `aria-live` for dynamic content announcements (via CDK’s LiveAnnouncer).  
- **Keyboard Navigation:** Ensure all interactive UI (search input, forecast cards, charts) are reachable by Tab/Arrow keys. The Fejiro001 weather app example stresses “Full keyboard navigation” and ARIA labels【3†L423-L428】.  
- **Contrast & Legibility:** Check color contrast (>=4.5:1). Provide focus indicators.  
- **Responsiveness:** Mobile-first design. Verify on real devices; ensure tap targets >=44px. Recruiters often view projects on phone to test layout【53†L83-L92】.  

## Security Best Practices  

- **Angular Security Model:** Rely on Angular’s built‑in XSS protection (auto-sanitisation of bindings)【29†L132-L142】. Do not disable sanitization. Use AOT mode in production【29†L148-L157】.  
- **Content Security Policy (CSP):** For advanced protection, configure CSP headers if possible (especially if deploying on your own backend).  
- **HTTPS:** Always use HTTPS for all API calls. Service worker mandates HTTPS, which Angular enforces (except localhost)【23†L189-L198】.  
- **Secrets:** Do NOT hard-code API keys in code. For front-end only, you may restrict API keys by referrer or use a proxy. (Or store keys in environment variables, but these will be bundled unless hidden via server.) If deploying serverless functions (optional), keep keys secure there.  
- **Input Sanitization:** If displaying any user input or third-party text (e.g. error messages), sanitize or escape to avoid injection.  

## Testing Strategy  

- **Unit Tests (Jest/Karma):** Write tests for components (rendering with fake data), services (mock HttpClient), and pipes/directives. Example: test that the temperature pipe works for Metric/Imperial conversion.  
- **Mocking APIs:** Use Angular’s `HttpTestingController` or Sinon/fetch-mock to simulate API responses and error conditions in tests.  
- **Integration Tests:** Test interaction of components (e.g. search → API call → view update).  
- **E2E Tests (Cypress):** Automate user flows: searching for a city, toggling units, adding a favorite, offline mode behavior (simulate offline). Validate PWA installability and service worker handling if possible.  
- **CI Integration:** Run tests on every pull request via CI.  

## CI/CD and Deployment Options  

- **CI/CD Pipeline:** Set up GitHub Actions (or GitLab CI, Bitbucket Pipelines) to run lint, build, and tests on push/PR. On success, deploy to hosting automatically (e.g. Netlify/GitHub Pages on merge). Use caching of node_modules.  
- **Docker:** Provide a `Dockerfile` (multistage build) to containerize the Angular app (serve using Nginx). This demonstrates DevOps skills.  
- **Hosting:** Common choices:  
  - **Netlify/Vercel (Jamstack hosts):** Free tiers are generous for personal projects【59†L7-L15】. Supports automatic deploys from Git. They handle SSL and CDN by default. Netlify adds forms and lambda functions easily.  
  - **AWS Amplify/CloudFront:** Free tier for small sites【59†L18-L20】. Good if you want to integrate AWS backend services later (AppSync, Cognito). Has CI from CodeCommit/GitHub.  
  - **Firebase Hosting:** Free Spark plan, global CDN. Simple CLI deploy.  
  - **GitHub Pages:** Works for static apps (but be careful with routing). It’s free and quick; a common choice for portfolios.  
- **Serverless (Optional):** Use AWS Lambda or Cloud Functions to store API keys or heavy logic (e.g. fetching and caching weather data), exposing your own small API to the front-end. This can keep keys off the client.  

## Deliverables  

- **Project Structure:** Well-organized Angular CLI workspace (components, modules, services). Possibly an NgRx folder for state. README guiding setup, run, test, and deployment instructions.  
- **Source Code:** Fully implemented Angular app with clear naming and folder structure (e.g. `/components`, `/services`, `/store`). Include meaningful comments only when necessary (avoid noise)【53†L129-L137】.  
- **README:** Describes app features, architecture, APIs used (with citations/links), setup steps, and a link to the live demo. Include screenshots or GIF demo if helpful.  
- **Tests:** Complete test suite. Include instructions (e.g. `npm test`, `npm run e2e`).  
- **Dockerfile:** If included, a multistage Dockerfile to build and serve the app. Also any deployment scripts (e.g. shell scripts, GitHub Actions YAML).  
- **Demo:** A live demo URL (continuous deployed). Ensure it’s mobile-friendly and accessible.  

## Evaluation Criteria (for recruiters)  

Recruiters and hiring managers will evaluate:【53†L72-L80】【53†L103-L112】  
- **Feature Completeness:** All requested features (weather data, forecasts, geolocation, etc.) work correctly. Unique extras (custom animations, ML suggestions, etc.) are a plus. Avoid triviality (e.g. just another basic weather app)【53†L179-L187】.  
- **UI/UX Quality:** Clean, responsive, and polished interface. Use design principles (good typography, spacing). Animations and theming enhance UX.  
- **Responsiveness & Performance:** The app must be responsive on mobile/tablet (not broken)【53†L83-L92】. Fast load times and good Lighthouse scores【53†L103-L112】.  
- **Code Quality:** Well-organized, modular, readable code. Consistent style (linting), logical file structure【53†L129-L137】. Appropriate use of Angular patterns (modules, components, services). Use of TypeScript interfaces/types. Meaningful variable and component names.  
- **Accessibility:** Basic a11y standards are met (keyboard nav, alt tags, contrast)【53†L194-L202】. Using accessible components is expected.  
- **State Management & Architecture:** Clear data flow (NgRx/actions or Signals), no prop-drilling, components decoupled. Demonstrates understanding of Angular architecture.  
- **Testing:** Presence of tests with good coverage. Passing CI. High test reliability.  
- **Documentation & Demo:** A concise README and working demo (no broken links)【53†L72-L80】. A recruiter will likely skip code without a live demo, so deployment is crucial.  
- **Innovation & Problem-Solving:** Any advanced features (e.g. push notifications, predictive model) or well-handled edge cases/improvements will impress.  
- **Professionalism:** No console errors, proper error messages. Clean commit history with descriptive messages can also help.

## Advanced (Optional) Features  

- **ML-Based Predictions:** Integrate a basic machine learning model (e.g. TensorFlow.js) to predict weather trends or suggest activities based on forecast. Example: “will it rain tomorrow?” based on pattern recognition. (Likely via Web Worker or serverless function.)  
- **Real-time Updates:** Use WebSockets or Server-Sent Events to push weather alerts/updates live (could simulate with a dummy endpoint).  
- **Push Notifications:** Leverage service worker to send scheduled/weather alerts notifications.  
- **GraphQL:** Instead of REST, use a GraphQL wrapper (e.g. Apollo) combining multiple weather APIs into one schema.  
- **Serverless Backend:** Use AWS Lambda/Firebase Functions as a BFF to handle API calls and key security, or to do aggregation (e.g. fetch from multiple APIs concurrently).

## Component Breakdown  

| Component                  | Responsibility                                                 | Inputs / State & Services                               |
|----------------------------|----------------------------------------------------------------|---------------------------------------------------------|
| **AppComponent**           | Root; includes router outlet, header (with theme/lang toggles) | Theme/service signals, language selector, navbar links   |
| **SearchComponent**        | Text input for city search with suggestions                    | Emits city name on submit; uses GeoService for autocomplete |
| **CurrentWeatherComponent**| Displays current weather details (temp, icon, condition)       | Takes weather data (from store/service) for selected city |
| **ForecastComponent**      | Shows 7-day forecast cards                                     | Receives daily forecast array; unit toggle affects display |
| **HourlyChartComponent**   | Renders hourly temperature graph (Chart.js/D3)                 | Data for next 24h temperatures; uses Chart library      |
| **MapComponent**           | Displays map centered on selected location                     | Coordinates (from geolocation or selected city); map API tokens |
| **FavoritesComponent**     | Lists saved favorite cities; allows remove/add                  | Reads/writes favorites (stored in NgRx or localStorage)  |
| **SettingsComponent**      | Unit (C/F, km/mi) and theme (light/dark) toggles               | Binds to user preferences in state (NgRx or service)     |
| **LoaderComponent**        | Shows spinner or skeleton UI during data fetch                 | Triggered by loading state in store or service          |
| **ErrorToastComponent**    | Pop-up or banner for error messages                            | Displays error messages from error handler service      |

*(Each component should be small and focused. Container components may fetch data via injected services or store, and pass sanitized data to child components.)*  

## Comparison Tables  

**Weather APIs:**  

| API (Docs)                   | Free Tier / Rate                               | Data & Features                                 | Auth & Notes                           |
|------------------------------|------------------------------------------------|-------------------------------------------------|----------------------------------------|
| OpenWeatherMap【9†L392-L399】  | 60 calls/min, 1,000,000 calls/month (free)    | Current, 5d/3h, 16d forecasts, alerts, maps     | API key in URL. Free tier very generous. |
| WeatherAPI.com【38†L299-L307】  | 1,000,000 calls/month (free) (3-day forecast) | Current, 3-10 day forecasts, history, AQI       | API key in header/param. Easy docs.      |
| Meteostat【43†L65-L69】        | 500 calls/month (free)                        | Hourly/daily historical climate data            | RapidAPI key needed. Use for history.    |
| Open-Meteo【40†L429-L433】    | Free (non-commercial)                          | Hourly forecasts, past data, solar/wind models  | No API key. Simple REST.                 |

**UI Libraries / Tools:**  

| Library/Tool       | Purpose                     | Notes                                                       |
|--------------------|-----------------------------|-------------------------------------------------------------|
| Angular Material【25†L149-L157】 | UI components & theming | Rich component set (buttons, cards, dialogs) with built-in accessibility【25†L149-L157】. Integrates with Angular CDK and theming. |
| Tailwind CSS       | Utility-first CSS           | Highly customisable. Not Angular-specific. Good for rapid UI prototyping. |
| NgRx               | State management           | Redux-style store for complex state. Boilerplate-heavy but powerful (actions/effects)【55†L87-L94】. Good for large apps. |
| Angular Signals/NgRx Signal Store | State management  | (Angular v21+) built-in reactive state. Less boilerplate, simpler learning curve. Still new.  |
| ngx-translate or Transloco | Internationalization   | Supports runtime language switching. Easier than Angular static i18n. |
| Chart.js (ng2-charts) | Charts & graphs          | Simple API, good default chart types (line, bar). Integrates easily. |
| D3.js              | Data visualization         | Powerful/custom charts. Steeper learning curve.            |
| Leaflet + ngx-leaflet | Maps                    | Open-source, integrates OSM tiles. Lightweight.           |
| Mapbox GL JS       | Maps & geospatial         | Sleek vector maps, but requires API token and has pricing after free tier. |
| @angular/pwa      | Service worker / PWA      | Angular’s official PWA tool (adds manifest and SW)【23†L151-L160】.     |
| Jest / Karma       | Unit testing              | Jest (fast) or Jasmine/Karma (Angular default) for components/services. |
| Cypress            | E2E testing               | Browser-based end-to-end tests (recommended over Protractor).  |

**Hosting / Deployment:**  

| Platform       | Free Tier / Pricing            | Features & Fit                      | References            |
|----------------|-------------------------------|-------------------------------------|-----------------------|
| **Netlify**【59†L11-L16】    | Generous free tier for small projects【59†L13-L17】 | Git-based CI/CD, global CDN, SSL, serverless functions, forms, rollbacks. Easy for static Angular. | React-focused, but Angular works well. GitHub integration. |
| **Vercel**【59†L7-L14】     | Generous free for personal use【59†L7-L14】 | Optimized for frontend frameworks (built by Next.js team). Auto-optimize & global CDN. Functions supported. Simple config. | Ideal for quick deploy; handles Angular though no SSR used. |
| **AWS Amplify**【59†L18-L20】 | Free tier; pay for bandwidth after | Scalable hosting, integrates with AWS backend (Auth, GraphQL). Custom domains, CI/CD. | Overkill for small projects, but shows AWS knowledge. Monitor costs【59†L18-L20】. |
| **Firebase Hosting** | Free Spark (10GB/mo)          | CDN, easy CLI deploy, SSL. Integrates with Firebase Auth/DB. | Good for fast static sites. Not covered above, but popular. |
| **GitHub Pages**  | Free                          | Static hosting via repo. Needs hack for SPA routing (404 fallback). | Simple if demo only needs static build. Often used for portfolios. |

## Example Code Generation Prompts  

To implement the refined prompt, an AI code assistant can be guided with specific sub‑prompts. For example:  

- *“Generate an Angular service `WeatherService` using `HttpClient` that fetches current weather and 7-day forecast from OpenWeatherMap. Include error handling and RxJS observables.”*  
- *“Create an Angular component `CurrentWeatherComponent` (with Angular Material) that displays temperature, humidity, wind, and icon for a given city. Accept an @Input() weather data model.”*  
- *“Write an NgRx action and effect to load weather data: `loadWeather(city)` that calls the API service and dispatches `loadWeatherSuccess(data)` or `loadWeatherFail(error)`.”*  
- *“Implement a search bar component that emits the entered city name on submit. Use Angular forms and add typeahead suggestions using a geocoding API.”*  
- *“Configure Angular PWA: write the steps/Angular CLI commands to add service worker (`ng add @angular/pwa`) and describe how `ngsw-config.json` caches the app shell.”*  
- *“Show a JSON example of the environment configuration file (`environment.ts`) storing API keys or endpoints.”*  
- *“Provide Cypress test code that visits the home page, performs a city search, and verifies the results appear.”*  

These prompts (and similar) ensure generated code aligns with the detailed requirements above.  

**Sources:** Official Angular docs and credible tech articles are used throughout for best practices【23†L151-L160】【25†L149-L157】【27†L121-L127】【29†L132-L142】, as well as authoritative API and deployment resources【9†L392-L399】【38†L299-L307】【43†L65-L69】【59†L7-L15】【53†L72-L80】. The comparisons and guidelines are grounded in current (2025–2026) information to ensure an up-to-date, production-quality Angular solution.