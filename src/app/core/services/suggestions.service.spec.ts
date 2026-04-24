import { TestBed } from '@angular/core/testing';

import { SuggestionsService } from './suggestions.service';
import {
  AirQualityReading,
  CurrentWeather,
  DailyForecastEntry,
  HourlyForecastEntry,
} from '@core/models/weather.model';

function ctx(over: Partial<{
  current: Partial<CurrentWeather>;
  today: Partial<DailyForecastEntry>;
  hourly: HourlyForecastEntry[];
  airQuality?: AirQualityReading;
}> = {}) {
  const current: CurrentWeather = {
    time: '2026-04-23T12:00',
    temperature: 18,
    apparentTemperature: 17,
    humidity: 50,
    windSpeed: 10,
    windDirection: 180,
    windGusts: 15,
    pressure: 1015,
    weatherCode: 2,
    isDay: true,
    precipitation: 0,
    cloudCover: 20,
    visibility: 16000,
    dewPoint: 8,
    ...over.current,
  };
  const today: DailyForecastEntry = {
    date: '2026-04-23',
    weatherCode: 2,
    tempMin: 10,
    tempMax: 22,
    precipitationSum: 0,
    precipitationProbability: 10,
    windSpeedMax: 15,
    sunrise: '2026-04-23T06:00',
    sunset: '2026-04-23T20:00',
    uvIndexMax: 3,
    daylightSeconds: 50400,
    ...over.today,
  };
  const hourly: HourlyForecastEntry[] =
    over.hourly ??
    Array.from({ length: 12 }, (_, i) => ({
      time: `2026-04-23T${String(12 + i).padStart(2, '0')}:00`,
      temperature: 18,
      precipitationProbability: 10,
      weatherCode: 2,
      windSpeed: 10,
    }));
  return { current, today, hourly, airQuality: over.airQuality, units: 'metric' as const };
}

describe('SuggestionsService', () => {
  let svc: SuggestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SuggestionsService] });
    svc = TestBed.inject(SuggestionsService);
  });

  it('recommends outdoor activities on mild, dry days', () => {
    const results = svc.recommend(ctx());
    const ids = results.map((r) => r.id);
    expect(ids).toContain('running');
    expect(ids).toContain('picnic');
  });

  it('recommends museums and umbrellas on rainy days', () => {
    const results = svc.recommend(
      ctx({
        today: { precipitationProbability: 90 },
        current: { cloudCover: 90 },
      }),
    );
    expect(results.map((r) => r.id)).toContain('museum');
    expect(results.map((r) => r.id)).toContain('umbrella');
    expect(results.map((r) => r.id)).not.toContain('picnic');
  });

  it('emits a mask suggestion when air quality is poor', () => {
    const results = svc.recommend(
      ctx({
        airQuality: {
          time: '2026-04-23T12:00',
          pm10: 80,
          pm25: 55,
          ozone: 50,
          no2: 40,
          europeanAqi: 105,
          usAqi: 150,
          uvIndex: 4,
        },
      }),
    );
    expect(results.map((r) => r.id)).toContain('mask');
  });

  it('sorts results by score descending and respects limit', () => {
    const results = svc.recommend(ctx(), 3);
    expect(results.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});
