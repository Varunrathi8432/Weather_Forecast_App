export interface GeoLocation {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  pressure: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  dewPoint: number;
}

export interface DailyForecastEntry {
  date: string;
  weatherCode: number;
  tempMin: number;
  tempMax: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  daylightSeconds: number;
}

export interface HourlyForecastEntry {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

export interface AirQualityReading {
  time: string;
  pm10: number;
  pm25: number;
  ozone: number;
  no2: number;
  europeanAqi: number;
  usAqi: number;
  uvIndex: number;
}

export interface WeatherAlert {
  id: string;
  severity: 'info' | 'advisory' | 'watch' | 'warning';
  /** Translation key for the alert title. */
  titleKey: string;
  /** Translation key for the alert description. */
  descriptionKey: string;
  /** Interpolation params passed to the translate pipe for descriptionKey. */
  params?: Record<string, string | number>;
  effective: string;
  expires: string;
}

export interface WeatherBundle {
  location: GeoLocation;
  current: CurrentWeather;
  daily: DailyForecastEntry[];
  hourly: HourlyForecastEntry[];
  airQuality?: AirQualityReading;
  alerts: WeatherAlert[];
  fetchedAt: number;
}

export type Units = 'metric' | 'imperial';
export type ThemeMode = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'hi';

export type ActivityCategory = 'outdoor' | 'fitness' | 'travel' | 'health' | 'wardrobe';

export interface ActivitySuggestion {
  id: string;
  category: ActivityCategory;
  /** Translation key for the suggestion title. */
  titleKey: string;
  /** Translation key for the suggestion rationale. */
  rationaleKey: string;
  /** Interpolation params for the rationale translation. */
  rationaleParams?: Record<string, string | number>;
  score: number;
  icon: string;
}
