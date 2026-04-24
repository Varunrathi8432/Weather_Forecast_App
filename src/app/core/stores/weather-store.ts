import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { catchError, EMPTY, finalize, tap } from 'rxjs';

import { GeoLocation, WeatherBundle } from '@core/models/weather.model';
import { GeoService } from '@core/services/geo.service';
import { PreferencesService } from '@core/services/preferences.service';
import { WeatherService } from '@core/services/weather.service';
import { ErrorService } from '@core/services/error.service';

const SELECTED_KEY = 'wfa.selected-location';
const BUNDLE_CACHE_KEY = 'wfa.last-bundle';

function readSelected(): GeoLocation | null {
  try {
    const raw = localStorage.getItem(SELECTED_KEY);
    return raw ? (JSON.parse(raw) as GeoLocation) : null;
  } catch {
    return null;
  }
}

function readBundle(): WeatherBundle | null {
  try {
    const raw = localStorage.getItem(BUNDLE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as WeatherBundle) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class WeatherStore {
  private readonly weather = inject(WeatherService);
  private readonly geo = inject(GeoService);
  private readonly prefs = inject(PreferencesService);
  private readonly errors = inject(ErrorService);

  private readonly _selected = signal<GeoLocation | null>(readSelected());
  private readonly _bundle = signal<WeatherBundle | null>(readBundle());
  private readonly _loading = signal(false);

  readonly selected = this._selected.asReadonly();
  readonly bundle = this._bundle.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly hasData = computed(() => this._bundle() !== null);

  constructor() {
    effect(() => {
      const sel = this._selected();
      if (sel) localStorage.setItem(SELECTED_KEY, JSON.stringify(sel));
    });
    effect(() => {
      const b = this._bundle();
      if (b) localStorage.setItem(BUNDLE_CACHE_KEY, JSON.stringify(b));
    });
    let firstUnitsRun = true;
    effect(() => {
      // Refetch only when units change (skip initial registration tick).
      this.prefs.units();
      if (firstUnitsRun) {
        firstUnitsRun = false;
        return;
      }
      const sel = untracked(() => this._selected());
      if (sel) this.fetch(sel);
    });
  }

  select(location: GeoLocation): void {
    this._selected.set(location);
    this.fetch(location);
  }

  refresh(): void {
    const sel = this._selected();
    if (sel) this.fetch(sel);
  }

  async locateMe(): Promise<void> {
    this._loading.set(true);
    try {
      const pos = await this.geo.currentPosition();
      this.geo
        .reverse(pos.coords.latitude, pos.coords.longitude)
        .subscribe({
          next: (loc) => {
            if (loc) this.select(loc);
          },
          error: () => {
            this.errors.push('Could not resolve your location.');
            this._loading.set(false);
          },
        });
    } catch (err) {
      this.errors.push(
        err instanceof Error ? err.message : 'Geolocation permission denied.',
      );
      this._loading.set(false);
    }
  }

  private fetch(location: GeoLocation): void {
    this._loading.set(true);
    this.weather
      .getWeather(location, this.prefs.units())
      .pipe(
        tap((bundle) => this._bundle.set(bundle)),
        catchError(() => EMPTY),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }
}
