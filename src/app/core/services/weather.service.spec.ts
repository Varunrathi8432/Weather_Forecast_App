import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { WeatherService } from './weather.service';
import { ConfigService } from './config.service';
import { GeoLocation } from '@core/models/weather.model';

const MOCK_FORECAST = {
  timezone: 'Europe/London',
  current: {
    time: '2026-04-23T12:00',
    temperature_2m: 12,
    apparent_temperature: 11,
    relative_humidity_2m: 60,
    wind_speed_10m: 10,
    wind_direction_10m: 180,
    wind_gusts_10m: 18,
    pressure_msl: 1012,
    weather_code: 2,
    is_day: 1,
    precipitation: 0,
    cloud_cover: 40,
    visibility: 16000,
    dew_point_2m: 6,
  },
  daily: {
    time: ['2026-04-23', '2026-04-24'],
    weather_code: [2, 61],
    temperature_2m_min: [7, 8],
    temperature_2m_max: [14, 13],
    precipitation_sum: [0, 2.1],
    precipitation_probability_max: [10, 70],
    wind_speed_10m_max: [15, 20],
    sunrise: ['2026-04-23T05:55', '2026-04-24T05:53'],
    sunset: ['2026-04-23T20:05', '2026-04-24T20:07'],
    uv_index_max: [3, 4],
    daylight_duration: [50400, 50520],
  },
  hourly: {
    time: ['2026-04-23T11:00', '2026-04-23T12:00', '2026-04-23T13:00'],
    temperature_2m: [11, 12, 13],
    precipitation_probability: [10, 20, 30],
    weather_code: [2, 2, 3],
    wind_speed_10m: [10, 12, 14],
  },
};

const MOCK_AIR = {
  current: {
    time: '2026-04-23T12:00',
    pm10: 12,
    pm2_5: 8,
    ozone: 55,
    nitrogen_dioxide: 10,
    european_aqi: 35,
    us_aqi: 40,
    uv_index: 3,
  },
};

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  const location: GeoLocation = {
    id: 1,
    name: 'London',
    country: 'UK',
    latitude: 51.5,
    longitude: -0.12,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        WeatherService,
        ConfigService,
      ],
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('maps API response and merges air quality into bundle', (done) => {
    service.getWeather(location, 'metric').subscribe((bundle) => {
      expect(bundle.location.name).toBe('London');
      expect(bundle.current.temperature).toBe(12);
      expect(bundle.current.windGusts).toBe(18);
      expect(bundle.daily.length).toBe(2);
      expect(bundle.hourly.length).toBeGreaterThan(0);
      expect(bundle.airQuality?.pm25).toBe(8);
      expect(bundle.alerts).toEqual([]);
      done();
    });

    const forecastReq = httpMock.expectOne((r) => r.url.endsWith('/forecast'));
    expect(forecastReq.request.params.get('temperature_unit')).toBe('celsius');
    forecastReq.flush(MOCK_FORECAST);

    const airReq = httpMock.expectOne((r) => r.url.endsWith('/air-quality'));
    airReq.flush(MOCK_AIR);
  });

  it('derives a high-UV advisory alert', (done) => {
    const highUv = {
      ...MOCK_FORECAST,
      daily: { ...MOCK_FORECAST.daily, uv_index_max: [9, 4] },
    };
    service.getWeather(location, 'metric').subscribe((bundle) => {
      expect(bundle.alerts.some((a) => a.id === 'uv')).toBeTrue();
      done();
    });
    httpMock.expectOne((r) => r.url.endsWith('/forecast')).flush(highUv);
    httpMock.expectOne((r) => r.url.endsWith('/air-quality')).flush(MOCK_AIR);
  });

  it('sends imperial unit params when requested', (done) => {
    service.getWeather(location, 'imperial').subscribe(() => done());
    const req = httpMock.expectOne((r) => r.url.endsWith('/forecast'));
    expect(req.request.params.get('temperature_unit')).toBe('fahrenheit');
    expect(req.request.params.get('wind_speed_unit')).toBe('mph');
    req.flush(MOCK_FORECAST);
    httpMock.expectOne((r) => r.url.endsWith('/air-quality')).flush(MOCK_AIR);
  });
});
