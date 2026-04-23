import { Injectable, effect, signal } from '@angular/core';

import { ThemeMode } from './models/weather.model';

const KEY = 'wfa.theme';

function initialMode(): ThemeMode {
  const saved = localStorage.getItem(KEY) as ThemeMode | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(initialMode());
  readonly mode = this._mode.asReadonly();

  constructor() {
    effect(() => {
      const mode = this._mode();
      document.documentElement.dataset['theme'] = mode;
      localStorage.setItem(KEY, mode);
    });
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  toggle(): void {
    this._mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }
}
