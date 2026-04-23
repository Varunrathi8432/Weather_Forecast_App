import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { environment } from '@env/environment';
import { GeoLocation } from './models/weather.model';

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
        reject(new Error('Geolocation is not supported by this browser.'));
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
    const params = new HttpParams()
      .set('latitude', lat)
      .set('longitude', lon)
      .set('count', 1)
      .set('language', 'en')
      .set('format', 'json');

    return this.http
      .get<GeocodingResponse>(`${environment.geocodingApiBase}/reverse`, { params })
      .pipe(
        map((res) => {
          if (res.results && res.results.length > 0) {
            return res.results[0];
          }
          return {
            id: Math.round(lat * 10000 + lon * 10),
            name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
            latitude: lat,
            longitude: lon,
          } satisfies GeoLocation;
        }),
      );
  }
}
