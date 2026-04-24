import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '@core/services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip translation bundle loads; they happen at startup and shouldn't flash a loader.
  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
