import { TestBed } from '@angular/core/testing';

import { PreferencesService } from './preferences.service';
import { GeoLocation } from '@core/models/weather.model';

describe('PreferencesService', () => {
  let service: PreferencesService;

  const london: GeoLocation = {
    id: 1,
    name: 'London',
    country: 'UK',
    latitude: 51.5,
    longitude: -0.12,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [PreferencesService] });
    service = TestBed.inject(PreferencesService);
  });

  it('defaults to metric units and English language', () => {
    expect(service.units()).toBe('metric');
    expect(service.language()).toBe('en');
  });

  it('toggles units between metric and imperial', () => {
    service.toggleUnits();
    expect(service.units()).toBe('imperial');
    service.toggleUnits();
    expect(service.units()).toBe('metric');
  });

  it('adds and removes a favorite', () => {
    expect(service.isFavorite(london.id)).toBeFalse();
    service.toggleFavorite(london);
    expect(service.isFavorite(london.id)).toBeTrue();
    expect(service.favorites().length).toBe(1);
    service.toggleFavorite(london);
    expect(service.favorites().length).toBe(0);
  });
});
