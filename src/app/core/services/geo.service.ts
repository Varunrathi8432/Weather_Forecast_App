import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '@env/environment';
import { GeoLocation } from '@core/models/weather.model';

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
}

interface ReverseGeocodingResponse {
  city?: string;
  locality?: string;
  localityInfo?: { administrative?: Array<{ name?: string; order?: number }> };
  principalSubdivision?: string;
  countryName?: string;
}

@Injectable({ providedIn: 'root' })
export class GeoService {
  private readonly http = inject(HttpClient);

  search(query: string): Observable<GeoLocation[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return of([]);
    }
    const params = new HttpParams()
      .set('name', trimmed)
      .set('count', 8)
      .set('language', 'en')
      .set('format', 'json');

    return this.http
      .get<GeocodingResponse>(`${environment.geocodingApiBase}/search`, { params })
      .pipe(map((res) => res.results ?? []));
  }

  currentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('errors.geoUnsupported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 600_000,
      });
    });
  }

  reverse(lat: number, lon: number): Observable<GeoLocation | null> {
    const fallback: GeoLocation = {
      id: Math.round(lat * 10000 + lon * 10),
      name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      latitude: lat,
      longitude: lon,
    };

    const params = new HttpParams()
      .set('latitude', lat)
      .set('longitude', lon)
      .set('localityLanguage', 'en');

    return this.http
      .get<ReverseGeocodingResponse>(
        'https://api.bigdatacloud.net/data/reverse-geocode-client',
        { params },
      )
      .pipe(
        map((res) => {
          const name = res.city || res.locality || res.principalSubdivision;
          if (!name) return fallback;
          return {
            id: fallback.id,
            name,
            country: res.countryName,
            admin1: res.principalSubdivision,
            latitude: lat,
            longitude: lon,
          } satisfies GeoLocation;
        }),
        catchError(() => of(fallback)),
      );
  }
}
