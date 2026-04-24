import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '@env/environment';

export interface RuntimeConfig {
  weatherApiBase: string;
  geocodingApiBase: string;
  airQualityApiBase: string;
  alertsApiBase: string;
  openWeatherMapKey: string;
  weatherApiComKey: string;
  vapidPublicKey: string;
  pushServerUrl: string;
  features: {
    pushNotifications: boolean;
    activityAI: boolean;
    airQuality: boolean;
    compare: boolean;
  };
}

const DEFAULTS: RuntimeConfig = {
  weatherApiBase: environment.weatherApiBase,
  geocodingApiBase: environment.geocodingApiBase,
  airQualityApiBase: 'https://air-quality-api.open-meteo.com/v1',
  alertsApiBase: '',
  openWeatherMapKey: '',
  weatherApiComKey: '',
  vapidPublicKey: '',
  pushServerUrl: '',
  features: {
    pushNotifications: false,
    activityAI: true,
    airQuality: true,
    compare: true,
  },
};

/**
 * Loads /assets/config/runtime-config.json at startup so API keys and feature
 * flags live outside the built bundle — deploy-time configurable via a config
 * file or environment substitution in CI.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private config: RuntimeConfig = DEFAULTS;

  async load(): Promise<void> {
    try {
      const loaded = await firstValueFrom(
        this.http.get<Partial<RuntimeConfig>>('assets/config/runtime-config.json'),
      );
      this.config = {
        ...DEFAULTS,
        ...loaded,
        features: { ...DEFAULTS.features, ...(loaded?.features ?? {}) },
      };
    } catch {
      // Fall back to defaults — app still works with Open-Meteo unauthenticated.
      this.config = DEFAULTS;
    }
  }

  get<K extends keyof RuntimeConfig>(key: K): RuntimeConfig[K] {
    return this.config[key];
  }

  feature(name: keyof RuntimeConfig['features']): boolean {
    return this.config.features[name];
  }

  snapshot(): RuntimeConfig {
    return this.config;
  }
}

