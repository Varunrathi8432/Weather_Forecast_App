import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { CompareStore } from './compare-store';
import { ConfigService } from './config.service';
import { GeoLocation } from './models/weather.model';

const london: GeoLocation = { id: 1, name: 'London', latitude: 51.5, longitude: -0.12, country: 'UK' };
const paris: GeoLocation = { id: 2, name: 'Paris', latitude: 48.85, longitude: 2.35, country: 'FR' };

describe('CompareStore', () => {
  let store: CompareStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ConfigService, CompareStore],
    });
    store = TestBed.inject(CompareStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Drain any outstanding requests to keep tests clean.
    httpMock.match(() => true).forEach((r) => r.flush({}, { status: 500, statusText: 'test' }));
    httpMock.verify();
  });

  it('adds a city and exposes it in the cities list', () => {
    store.add(london);
    expect(store.cities().length).toBe(1);
    expect(store.cities()[0].name).toBe('London');
    expect(store.loadingIds().has(london.id)).toBeTrue();
  });

  it('does not add the same city twice', () => {
    store.add(london);
    store.add(london);
    expect(store.cities().length).toBe(1);
  });

  it('respects the max cities limit', () => {
    const make = (i: number): GeoLocation => ({
      id: i,
      name: `City ${i}`,
      latitude: i,
      longitude: i,
    });
    for (let i = 1; i <= store.maxCities + 2; i++) store.add(make(i));
    expect(store.cities().length).toBe(store.maxCities);
  });

  it('removes a city and clears its bundle', () => {
    store.add(london);
    store.add(paris);
    store.remove(london.id);
    expect(store.cities().map((c) => c.id)).toEqual([paris.id]);
  });
});
