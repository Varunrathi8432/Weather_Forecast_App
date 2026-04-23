import { Injectable } from '@angular/core';

import {
  ActivitySuggestion,
  AirQualityReading,
  CurrentWeather,
  DailyForecastEntry,
  HourlyForecastEntry,
  Units,
} from './models/weather.model';

interface SuggestionContext {
  current: CurrentWeather;
  today: DailyForecastEntry;
  hourly: HourlyForecastEntry[];
  airQuality?: AirQualityReading;
  units: Units;
}

interface Rule {
  id: string;
  category: ActivitySuggestion['category'];
  title: string;
  icon: string;
  /** Returns a score from 0–1 indicating fit; rationale explains why. */
  evaluate: (ctx: SuggestionContext) => { score: number; rationale: string } | null;
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
    title: 'Great conditions for a run',
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
        rationale: `Low rain risk (${today.precipitationProbability}%), manageable wind (${Math.round(current.windSpeed)}), temps near ${Math.round(tempC)}°C.`,
      };
    },
  },
  {
    id: 'cycling',
    category: 'fitness',
    title: 'Good weather for cycling',
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
        rationale: `Mild ${Math.round(tempC)}°C with wind ${Math.round(current.windSpeed)} km/h and ${today.precipitationProbability}% rain chance.`,
      };
    },
  },
  {
    id: 'picnic',
    category: 'outdoor',
    title: 'Pack a picnic',
    icon: '🧺',
    evaluate: ({ current, today }) => {
      if (today.precipitationProbability > 25) return null;
      const tempC = toC(current.temperature);
      if (tempC < 14) return null;
      const score = clamp(gaussian(tempC, 22, 5) * dryFactor(today));
      if (score < 0.4) return null;
      return {
        score,
        rationale: `Dry day (${today.precipitationProbability}% rain) with comfortable ${Math.round(tempC)}°C.`,
      };
    },
  },
  {
    id: 'stargazing',
    category: 'outdoor',
    title: 'Clear skies for stargazing',
    icon: '🔭',
    evaluate: ({ current, today }) => {
      if (current.cloudCover >= 40) return null;
      if (today.precipitationProbability > 20) return null;
      const score = clamp(1 - current.cloudCover / 100) * 0.9;
      if (score < 0.5) return null;
      return {
        score,
        rationale: `Only ${Math.round(current.cloudCover)}% cloud cover expected tonight.`,
      };
    },
  },
  {
    id: 'museum',
    category: 'travel',
    title: 'Great day for museums',
    icon: '🏛️',
    evaluate: ({ today, current }) => {
      if (today.precipitationProbability < 50 && current.cloudCover < 60) return null;
      const score = clamp(today.precipitationProbability / 100 * 0.8 + (current.cloudCover / 100) * 0.2);
      return {
        score,
        rationale: `Rain probability ${today.precipitationProbability}% — a perfect indoor day.`,
      };
    },
  },
  {
    id: 'uv-protection',
    category: 'health',
    title: 'Apply sunscreen + sunglasses',
    icon: '🧴',
    evaluate: ({ today, airQuality }) => {
      const uv = airQuality?.uvIndex ?? today.uvIndexMax;
      if (uv < 6) return null;
      return {
        score: clamp(Math.min(uv / 11, 1)),
        rationale: `UV index peaks at ${uv.toFixed(1)} — high exposure risk without protection.`,
      };
    },
  },
  {
    id: 'hydrate',
    category: 'health',
    title: 'Hydrate frequently',
    icon: '💧',
    evaluate: ({ current }) => {
      const tempC = toC(current.temperature);
      if (tempC < 26) return null;
      return {
        score: clamp((tempC - 25) / 15),
        rationale: `Feels like ${Math.round(toC(current.apparentTemperature))}°C — carry water.`,
      };
    },
  },
  {
    id: 'layers',
    category: 'wardrobe',
    title: 'Dress in warm layers',
    icon: '🧥',
    evaluate: ({ current, today }) => {
      const tempC = toC(current.temperature);
      if (tempC > 10) return null;
      const spread = Math.abs(toC(today.tempMax) - toC(today.tempMin));
      const score = clamp(0.5 + spread / 20);
      return {
        score,
        rationale: `Cold ${Math.round(tempC)}°C with ${Math.round(spread)}°C spread today.`,
      };
    },
  },
  {
    id: 'umbrella',
    category: 'wardrobe',
    title: 'Grab an umbrella',
    icon: '☂️',
    evaluate: ({ today, hourly }) => {
      const max = Math.max(today.precipitationProbability, ...hourly.slice(0, 12).map((h) => h.precipitationProbability));
      if (max < 40) return null;
      return {
        score: clamp(max / 100),
        rationale: `Up to ${max}% chance of rain in the next 12 hours.`,
      };
    },
  },
  {
    id: 'mask',
    category: 'health',
    title: 'Consider a mask outdoors',
    icon: '😷',
    evaluate: ({ airQuality }) => {
      if (!airQuality || airQuality.europeanAqi < 80) return null;
      return {
        score: clamp(airQuality.europeanAqi / 120),
        rationale: `European AQI is ${Math.round(airQuality.europeanAqi)} — sensitive groups should limit exposure.`,
      };
    },
  },
];

@Injectable({ providedIn: 'root' })
export class SuggestionsService {
  recommend(ctx: SuggestionContext, limit = 4): ActivitySuggestion[] {
    return RULES.map((rule) => {
      const result = rule.evaluate(ctx);
      if (!result) return null;
      return {
        id: rule.id,
        category: rule.category,
        title: rule.title,
        rationale: result.rationale,
        score: result.score,
        icon: rule.icon,
      } satisfies ActivitySuggestion;
    })
      .filter((s): s is ActivitySuggestion => s !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
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
