import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ErrorService } from '@core/services/error.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errors = inject(ErrorService);
  // Lazy-resolve TranslateService to avoid a circular DI: TranslateService
  // depends on HttpClient, and HttpClient runs this interceptor.
  const injector = inject(Injector);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const translate = injector.get(TranslateService);
      const msg = err.status === 0
        ? translate.instant('errors.network')
        : translate.instant('errors.requestFailed', {
            status: err.status,
            statusText: err.statusText || translate.instant('errors.unknown'),
          });
      errors.push(msg);
      return throwError(() => err);
    }),
  );
};
