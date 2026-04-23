import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';

import { GeoLocation, WeatherBundle } from './models/weather.model';
import { PreferencesService } from './preferences.service';
import { WeatherService } from './weather.service';
import { ErrorService } from './error.service';

const KEY_CITIES = 'wfa.compare.cities';
const KEY_BUNDLES = 'wfa.compare.bundles';
const MAX_CITIES = 4;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

@Injectable({ providedIn: 'root' })
export class CompareStore {
  private readonly weather = inject(WeatherService);
  private readonly prefs = inject(PreferencesService);
  private readonly errors = inject(ErrorService);

  private readonly _cities = signal<GeoLocation[]>(readJson<GeoLocation[]>(KEY_CITIES, []));
  private readonly _bundles = signal<Record<number, WeatherBundle>>(
    readJson<Record<number, WeatherBundle>>(KEY_BUNDLES, {}),
  );
  private readonly _loadingIds = signal(new Set<number>());

  readonly cities = this._cities.asReadonly();
  readonly bundles = this._bundles.asReadonly();
  readonly loadingIds = this._loadingIds.asReadonly();
  readonly hasRoom = computed(() => this._cities().length < MAX_CITIES);
  readonly maxCities = MAX_CITIES;

  constructor() {
    effect(() => localStorage.setItem(KEY_CITIES, JSON.stringify(this._cities())));
    effect(() => localStorage.setItem(KEY_BUNDLES, JSON.stringify(this._bundles())));

    let first = true;
    effect(() => {
      this.prefs.units();
      if (first) {
        first = false;
        return;
      }
      // Refetch each city when units change.
      const cities = untracked(() => this._cities());
      cities.forEach((c) => this.fetch(c));
    });
  }

  add(city: GeoLocation): void {
    if (this._cities().some((c) => c.id === city.id)) return;
    if (this._cities().length >= MAX_CITIES) {
      this.errors.push(`You can compare up to ${MAX_CITIES} cities at once.`);
      return;
    }
    this._cities.update((list) => [...list, city]);
    this.fetch(city);
  }

  remove(id: number): void {
    this._cities.update((list) => list.filter((c) => c.id !== id));
    this._bundles.update((b) => {
      const copy = { ...b };
      delete copy[id];
      return copy;
    });
  }

  clear(): void {
    this._cities.set([]);
    this._bundles.set({});
  }

  refresh(): void {
    this._cities().forEach((c) => this.fetch(c));
  }

  private fetch(city: GeoLocation): void {
    this._loadingIds.update((set) => {
      const copy = new Set(set);
      copy.add(city.id);
      return copy;
    });
    this.weather
      .getWeather(city, this.prefs.units())
      .pipe(
        catchError(() => EMPTY),
        finalize(() => {
          this._loadingIds.update((set) => {
            const copy = new Set(set);
            copy.delete(city.id);
            return copy;
          });
        }),
      )
      .subscribe((bundle) => {
        this._bundles.update((b) => ({ ...b, [city.id]: bundle }));
      });
  }
}
