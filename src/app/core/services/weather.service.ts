import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfigService } from './config.service';
import {
  AirQualityReading,
  CurrentWeather,
  DailyForecastEntry,
  GeoLocation,
  HourlyForecastEntry,
  Units,
  WeatherAlert,
  WeatherBundle,
} from '@core/models/weather.model';

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    pressure_msl: number;
    weather_code: number;
    is_day: 0 | 1;
    precipitation: number;
    cloud_cover: number;
    visibility?: number;
    dew_point_2m?: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    daylight_duration?: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    visibility?: number[];
    dew_point_2m?: number[];
  };
  timezone: string;
}

interface AirQualityResponse {
  current: {
    time: string;
    pm10: number;
    pm2_5: number;
    ozone: number;
    nitrogen_dioxide: number;
    european_aqi: number;
    us_aqi: number;
    uv_index: number;
  };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  getWeather(location: GeoLocation, units: Units): Observable<WeatherBundle> {
    const forecast$ = this.getForecast(location, units);
    const air$ = this.config.feature('airQuality')
      ? this.getAirQuality(location).pipe(catchError(() => of<AirQualityReading | undefined>(undefined)))
      : of<AirQualityReading | undefined>(undefined);

    return forkJoin({ forecast: forecast$, airQuality: air$ }).pipe(
      map(({ forecast, airQuality }) => ({
        ...forecast,
        airQuality,
        alerts: this.deriveAlerts(forecast, airQuality),
      })),
    );
  }

  private getForecast(
    location: GeoLocation,
    units: Units,
  ): Observable<Omit<WeatherBundle, 'airQuality' | 'alerts'>> {
    const params = new HttpParams()
      .set('latitude', location.latitude)
      .set('longitude', location.longitude)
      .set(
        'current',
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,weather_code,is_day,precipitation,cloud_cover,visibility,dew_point_2m',
      )
      .set(
        'daily',
        'weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max,daylight_duration',
      )
      .set('hourly', 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m')
      .set('timezone', 'auto')
      .set('forecast_days', 7)
      .set('temperature_unit', units === 'imperial' ? 'fahrenheit' : 'celsius')
      .set('wind_speed_unit', units === 'imperial' ? 'mph' : 'kmh')
      .set('precipitation_unit', units === 'imperial' ? 'inch' : 'mm');

    return this.http
      .get<OpenMeteoResponse>(`${this.config.get('weatherApiBase')}/forecast`, { params })
      .pipe(map((res) => this.toBundle(location, res)));
  }

  private getAirQuality(location: GeoLocation): Observable<AirQualityReading> {
    const params = new HttpParams()
      .set('latitude', location.latitude)
      .set('longitude', location.longitude)
      .set('current', 'pm10,pm2_5,ozone,nitrogen_dioxide,european_aqi,us_aqi,uv_index')
      .set('timezone', 'auto');

    return this.http
      .get<AirQualityResponse>(`${this.config.get('airQualityApiBase')}/air-quality`, { params })
      .pipe(
        map((res) => ({
          time: res.current.time,
          pm10: res.current.pm10,
          pm25: res.current.pm2_5,
          ozone: res.current.ozone,
          no2: res.current.nitrogen_dioxide,
          europeanAqi: res.current.european_aqi,
          usAqi: res.current.us_aqi,
          uvIndex: res.current.uv_index,
        })),
      );
  }

  private deriveAlerts(
    bundle: Omit<WeatherBundle, 'airQuality' | 'alerts'>,
    air: AirQualityReading | undefined,
  ): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const { current, daily } = bundle;

    if (current.windGusts && current.windGusts >= 60) {
      alerts.push({
        id: 'wind',
        severity: 'warning',
        titleKey: 'alerts.wind.title',
        descriptionKey: 'alerts.wind.description',
        params: { gusts: Math.round(current.windGusts) },
        effective: current.time,
        expires: daily[0]?.date ?? current.time,
      });
    }

    const maxPop = Math.max(...daily.slice(0, 2).map((d) => d.precipitationProbability ?? 0));
    if (maxPop >= 85) {
      alerts.push({
        id: 'rain',
        severity: 'advisory',
        titleKey: 'alerts.rain.title',
        descriptionKey: 'alerts.rain.description',
        params: { maxPop },
        effective: current.time,
        expires: daily[1]?.date ?? current.time,
      });
    }

    if (daily[0] && daily[0].uvIndexMax >= 8) {
      alerts.push({
        id: 'uv',
        severity: 'advisory',
        titleKey: 'alerts.uv.title',
        descriptionKey: 'alerts.uv.description',
        params: { uv: daily[0].uvIndexMax.toFixed(1) },
        effective: daily[0].date,
        expires: daily[0].date,
      });
    }

    if (air && air.europeanAqi >= 80) {
      alerts.push({
        id: 'aqi',
        severity: air.europeanAqi >= 100 ? 'warning' : 'advisory',
        titleKey: 'alerts.aqi.title',
        descriptionKey: 'alerts.aqi.description',
        params: { aqi: Math.round(air.europeanAqi) },
        effective: air.time,
        expires: air.time,
      });
    }

    return alerts;
  }

  private toBundle(
    location: GeoLocation,
    res: OpenMeteoResponse,
  ): Omit<WeatherBundle, 'airQuality' | 'alerts'> {
    const current: CurrentWeather = {
      time: res.current.time,
      temperature: res.current.temperature_2m,
      apparentTemperature: res.current.apparent_temperature,
      humidity: res.current.relative_humidity_2m,
      windSpeed: res.current.wind_speed_10m,
      windDirection: res.current.wind_direction_10m,
      windGusts: res.current.wind_gusts_10m ?? 0,
      pressure: res.current.pressure_msl,
      weatherCode: res.current.weather_code,
      isDay: res.current.is_day === 1,
      precipitation: res.current.precipitation,
      cloudCover: res.current.cloud_cover,
      visibility: res.current.visibility ?? 0,
      dewPoint: res.current.dew_point_2m ?? 0,
    };

    const daily: DailyForecastEntry[] = res.daily.time.map((date, i) => ({
      date,
      weatherCode: res.daily.weather_code[i],
      tempMin: res.daily.temperature_2m_min[i],
      tempMax: res.daily.temperature_2m_max[i],
      precipitationSum: res.daily.precipitation_sum[i],
      precipitationProbability: res.daily.precipitation_probability_max[i],
      windSpeedMax: res.daily.wind_speed_10m_max[i],
      sunrise: res.daily.sunrise[i],
      sunset: res.daily.sunset[i],
      uvIndexMax: res.daily.uv_index_max[i],
      daylightSeconds: res.daily.daylight_duration?.[i] ?? 0,
    }));

    const nowIdx = this.findHourIndex(res.hourly.time, res.current.time);
    const slice = res.hourly.time.slice(nowIdx, nowIdx + 24);
    const hourly: HourlyForecastEntry[] = slice.map((time, i) => ({
      time,
      temperature: res.hourly.temperature_2m[nowIdx + i],
      precipitationProbability: res.hourly.precipitation_probability[nowIdx + i],
      weatherCode: res.hourly.weather_code[nowIdx + i],
      windSpeed: res.hourly.wind_speed_10m[nowIdx + i],
    }));

    return {
      location: { ...location, timezone: res.timezone },
      current,
      daily,
      hourly,
      fetchedAt: Date.now(),
    };
  }

  private findHourIndex(times: string[], currentTime: string): number {
    const target = currentTime.slice(0, 13);
    const idx = times.findIndex((t) => t.slice(0, 13) === target);
    return idx >= 0 ? idx : 0;
  }
}
