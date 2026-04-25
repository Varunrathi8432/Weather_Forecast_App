import { Injectable } from '@angular/core';

import {
  ActivitySuggestion,
  AirQualityReading,
  CurrentWeather,
  DailyForecastEntry,
  HourlyForecastEntry,
  Units,
} from '@core/models/weather.model';

interface SuggestionContext {
  current: CurrentWeather;
  today: DailyForecastEntry;
  hourly: HourlyForecastEntry[];
  airQuality?: AirQualityReading;
  units: Units;
}

interface RuleResult {
  score: number;
  rationaleKey: string;
  rationaleParams: Record<string, string | number>;
}

interface Rule {
  id: string;
  category: ActivitySuggestion['category'];
  titleKey: string;
  icon: string;
  /** Returns a score from 0–1 indicating fit; rationale describes why. */
  evaluate: (ctx: SuggestionContext) => RuleResult | null;
}

/**
 * A deliberately interpretable, rule-based "activity AI". Each rule emits a
 * fit score and a rationale; the top-N are shown to the user. Keeping this
 * non-opaque (unlike an ML black box) is a better UX for a weather app and
 * demonstrates a clean scoring / ranking pattern.
 */
const RULES: Rule[] = [
  {
    id: 'running',
    category: 'fitness',
    titleKey: 'suggestions.running.title',
    icon: '🏃',
    evaluate: ({ current, today, airQuality }) => {
      const tempC = toC(current.temperature);
      if (current.precipitation > 0.5) return null;
      if (today.precipitationProbability > 40) return null;
      if (airQuality && airQuality.europeanAqi >= 60) return null;
      const tempScore = gaussian(tempC, 14, 6);
      const windScore = Math.max(0, 1 - current.windSpeed / 50);
      const score = clamp((tempScore * 0.7 + windScore * 0.3) * dryFactor(today));
      if (score < 0.45) return null;
      return {
        score,
        rationaleKey: 'suggestions.running.rationale',
        rationaleParams: {
          pop: today.precipitationProbability,
          wind: Math.round(current.windSpeed),
          temp: Math.round(tempC),
        },
      };
    },
  },
  {
    id: 'cycling',
    category: 'fitness',
    titleKey: 'suggestions.cycling.title',
    icon: '🚴',
    evaluate: ({ current, today }) => {
      if (today.precipitationProbability > 35 || current.windSpeed >= 40) return null;
      const tempC = toC(current.temperature);
      const tempScore = gaussian(tempC, 18, 7);
      const windScore = Math.max(0, 1 - current.windSpeed / 45);
      const score = clamp(tempScore * 0.6 + windScore * 0.4);
      if (score < 0.4) return null;
      return {
        score,
        rationaleKey: 'suggestions.cycling.rationale',
        rationaleParams: {
          temp: Math.round(tempC),
          wind: Math.round(current.windSpeed),
          pop: today.precipitationProbability,
        },
      };
    },
  },
  {
    id: 'picnic',
    category: 'outdoor',
    titleKey: 'suggestions.picnic.title',
    icon: '🧺',
    evaluate: ({ current, today }) => {
      if (today.precipitationProbability > 25) return null;
      const tempC = toC(current.temperature);
      if (tempC < 14) return null;
      const score = clamp(gaussian(tempC, 22, 5) * dryFactor(today));
      if (score < 0.4) return null;
      return {
        score,
        rationaleKey: 'suggestions.picnic.rationale',
        rationaleParams: {
          pop: today.precipitationProbability,
          temp: Math.round(tempC),
        },
      };
    },
  },
  {
    id: 'stargazing',
    category: 'outdoor',
    titleKey: 'suggestions.stargazing.title',
    icon: '🔭',
    evaluate: ({ current, today }) => {
      if (current.cloudCover >= 40) return null;
      if (today.precipitationProbability > 20) return null;
      const score = clamp(1 - current.cloudCover / 100) * 0.9;
      if (score < 0.5) return null;
      return {
        score,
        rationaleKey: 'suggestions.stargazing.rationale',
        rationaleParams: {
          cloud: Math.round(current.cloudCover),
        },
      };
    },
  },
  {
    id: 'museum',
    category: 'travel',
    titleKey: 'suggestions.museum.title',
    icon: '🏛️',
    evaluate: ({ today, current }) => {
      if (today.precipitationProbability < 50 && current.cloudCover < 60) return null;
      const score = clamp(today.precipitationProbability / 100 * 0.8 + (current.cloudCover / 100) * 0.2);
      return {
        score,
        rationaleKey: 'suggestions.museum.rationale',
        rationaleParams: {
          pop: today.precipitationProbability,
        },
      };
    },
  },
  {
    id: 'uv-protection',
    category: 'health',
    titleKey: 'suggestions.uvProtection.title',
    icon: '🧴',
    evaluate: ({ today, airQuality }) => {
      const uv = airQuality?.uvIndex ?? today.uvIndexMax;
      if (uv < 6) return null;
      return {
        score: clamp(Math.min(uv / 11, 1)),
        rationaleKey: 'suggestions.uvProtection.rationale',
        rationaleParams: {
          uv: uv.toFixed(1),
        },
      };
    },
  },
  {
    id: 'hydrate',
    category: 'health',
    titleKey: 'suggestions.hydrate.title',
    icon: '💧',
    evaluate: ({ current }) => {
      const tempC = toC(current.temperature);
      if (tempC < 26) return null;
      return {
        score: clamp((tempC - 25) / 15),
        rationaleKey: 'suggestions.hydrate.rationale',
        rationaleParams: {
          feels: Math.round(toC(current.apparentTemperature)),
        },
      };
    },
  },
  {
    id: 'layers',
    category: 'wardrobe',
    titleKey: 'suggestions.layers.title',
    icon: '🧥',
    evaluate: ({ current, today }) => {
      const tempC = toC(current.temperature);
      if (tempC > 10) return null;
      const spread = Math.abs(toC(today.tempMax) - toC(today.tempMin));
      const score = clamp(0.5 + spread / 20);
      return {
        score,
        rationaleKey: 'suggestions.layers.rationale',
        rationaleParams: {
          temp: Math.round(tempC),
          spread: Math.round(spread),
        },
      };
    },
  },
  {
    id: 'umbrella',
    category: 'wardrobe',
    titleKey: 'suggestions.umbrella.title',
    icon: '☂️',
    evaluate: ({ today, hourly }) => {
      const max = Math.max(today.precipitationProbability, ...hourly.slice(0, 12).map((h) => h.precipitationProbability));
      if (max < 40) return null;
      return {
        score: clamp(max / 100),
        rationaleKey: 'suggestions.umbrella.rationale',
        rationaleParams: {
          pop: max,
        },
      };
    },
  },
  {
    id: 'mask',
    category: 'health',
    titleKey: 'suggestions.mask.title',
    icon: '😷',
    evaluate: ({ airQuality }) => {
      if (!airQuality || airQuality.europeanAqi < 80) return null;
      return {
        score: clamp(airQuality.europeanAqi / 120),
        rationaleKey: 'suggestions.mask.rationale',
        rationaleParams: {
          aqi: Math.round(airQuality.europeanAqi),
        },
      };
    },
  },
];

@Injectable({ providedIn: 'root' })
export class SuggestionsService {
  recommend(ctx: SuggestionContext, limit = 4): ActivitySuggestion[] {
    const items: ActivitySuggestion[] = [];
    for (const rule of RULES) {
      const result = rule.evaluate(ctx);
      if (!result) continue;
      items.push({
        id: rule.id,
        category: rule.category,
        titleKey: rule.titleKey,
        rationaleKey: result.rationaleKey,
        rationaleParams: result.rationaleParams,
        score: result.score,
        icon: rule.icon,
      });
    }
    return items.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function gaussian(value: number, mean: number, stdDev: number): number {
  return Math.exp(-Math.pow(value - mean, 2) / (2 * stdDev * stdDev));
}

function dryFactor(day: DailyForecastEntry): number {
  return 1 - day.precipitationProbability / 200;
}

function toC(value: number): number {
  // Values already in °C when units are metric; treat Fahrenheit heuristically.
  if (value > 60) return ((value - 32) * 5) / 9;
  return value;
}
