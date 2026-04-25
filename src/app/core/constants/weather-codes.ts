export interface WeatherCodeInfo {
  /** Translation key for the weather condition label. */
  labelKey: string;
  icon: string;
}

const TABLE: Record<number, WeatherCodeInfo> = {
  0: { labelKey: 'weatherCodes.0', icon: '☀️' },
  1: { labelKey: 'weatherCodes.1', icon: '🌤️' },
  2: { labelKey: 'weatherCodes.2', icon: '⛅' },
  3: { labelKey: 'weatherCodes.3', icon: '☁️' },
  45: { labelKey: 'weatherCodes.45', icon: '🌫️' },
  48: { labelKey: 'weatherCodes.48', icon: '🌫️' },
  51: { labelKey: 'weatherCodes.51', icon: '🌦️' },
  53: { labelKey: 'weatherCodes.53', icon: '🌦️' },
  55: { labelKey: 'weatherCodes.55', icon: '🌧️' },
  56: { labelKey: 'weatherCodes.56', icon: '🌧️' },
  57: { labelKey: 'weatherCodes.57', icon: '🌧️' },
  61: { labelKey: 'weatherCodes.61', icon: '🌦️' },
  63: { labelKey: 'weatherCodes.63', icon: '🌧️' },
  65: { labelKey: 'weatherCodes.65', icon: '🌧️' },
  66: { labelKey: 'weatherCodes.66', icon: '🌧️' },
  67: { labelKey: 'weatherCodes.67', icon: '🌧️' },
  71: { labelKey: 'weatherCodes.71', icon: '🌨️' },
  73: { labelKey: 'weatherCodes.73', icon: '🌨️' },
  75: { labelKey: 'weatherCodes.75', icon: '❄️' },
  77: { labelKey: 'weatherCodes.77', icon: '❄️' },
  80: { labelKey: 'weatherCodes.80', icon: '🌦️' },
  81: { labelKey: 'weatherCodes.81', icon: '🌧️' },
  82: { labelKey: 'weatherCodes.82', icon: '⛈️' },
  85: { labelKey: 'weatherCodes.85', icon: '🌨️' },
  86: { labelKey: 'weatherCodes.86', icon: '❄️' },
  95: { labelKey: 'weatherCodes.95', icon: '⛈️' },
  96: { labelKey: 'weatherCodes.96', icon: '⛈️' },
  99: { labelKey: 'weatherCodes.99', icon: '⛈️' },
};

export function describeWeatherCode(code: number): WeatherCodeInfo {
  return TABLE[code] ?? { labelKey: 'weatherCodes.unknown', icon: '❓' };
}
