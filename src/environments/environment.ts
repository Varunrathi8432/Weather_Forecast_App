export const environment = {
  production: false,
  weatherApiBase: process.env['WEATHER_API_BASE'] || 'https://api.open-meteo.com/v1',
  geocodingApiBase: process.env['GEOCODING_API_BASE'] || 'https://geocoding-api.open-meteo.com/v1',
  airQualityApiBase: process.env['AIR_QUALITY_API_BASE'] || 'https://air-quality-api.open-meteo.com/v1',
  openWeatherMapKey: process.env['OPENWEATHERMAP_API_KEY'] || '',
  openWeatherMapBase: process.env['OPENWEATHERMAP_BASE'] || 'https://api.openweathermap.org/data/2.5',
  mapTileUrl: process.env['MAP_TILE_URL'] || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapAttribution: process.env['MAP_ATTRIBUTION'] || '&copy; OpenStreetMap contributors',
};
