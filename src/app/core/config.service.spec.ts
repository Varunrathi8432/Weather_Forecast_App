import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ConfigService],
    });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('merges runtime JSON with defaults', async () => {
    const promise = service.load();
    const req = httpMock.expectOne('assets/config/runtime-config.json');
    req.flush({
      openWeatherMapKey: 'ABC',
      features: { pushNotifications: true },
    });
    await promise;

    expect(service.get('openWeatherMapKey')).toBe('ABC');
    expect(service.feature('pushNotifications')).toBeTrue();
    // feature defaults preserved when not overridden
    expect(service.feature('activityAI')).toBeTrue();
  });

  it('falls back to defaults on error', async () => {
    const promise = service.load();
    httpMock.expectOne('assets/config/runtime-config.json').error(new ProgressEvent('network error'));
    await promise;
    expect(service.feature('airQuality')).toBeTrue();
    expect(service.get('openWeatherMapKey')).toBe('');
  });
});
