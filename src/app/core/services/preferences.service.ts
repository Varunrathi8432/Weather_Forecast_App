import { Injectable, computed, effect, signal } from '@angular/core';

import { GeoLocation, Language, Units } from '@core/models/weather.model';

const KEY_UNITS = 'wfa.units';
const KEY_LANG = 'wfa.language';
const KEY_FAVS = 'wfa.favorites';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readString<T extends string>(key: string, fallback: T): T {
  const v = localStorage.getItem(key);
  return (v as T) ?? fallback;
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly _units = signal<Units>(readString<Units>(KEY_UNITS, 'metric'));
  private readonly _language = signal<Language>(readString<Language>(KEY_LANG, 'en'));
  private readonly _favorites = signal<GeoLocation[]>(readJson<GeoLocation[]>(KEY_FAVS, []));

  readonly units = this._units.asReadonly();
  readonly language = this._language.asReadonly();
  readonly favorites = this._favorites.asReadonly();
  readonly favoriteIds = computed(() => new Set(this._favorites().map((f) => f.id)));

  constructor() {
    effect(() => localStorage.setItem(KEY_UNITS, this._units()));
    effect(() => localStorage.setItem(KEY_LANG, this._language()));
    effect(() => localStorage.setItem(KEY_FAVS, JSON.stringify(this._favorites())));
  }

  setUnits(units: Units): void {
    this._units.set(units);
  }

  toggleUnits(): void {
    this._units.update((u) => (u === 'metric' ? 'imperial' : 'metric'));
  }

  setLanguage(lang: Language): void {
    this._language.set(lang);
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds().has(id);
  }

  toggleFavorite(location: GeoLocation): void {
    this._favorites.update((list) => {
      const exists = list.some((f) => f.id === location.id);
      if (exists) return list.filter((f) => f.id !== location.id);
      return [...list, location];
    });
  }

  removeFavorite(id: number): void {
    this._favorites.update((list) => list.filter((f) => f.id !== id));
  }
}
