import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ErrorService } from '@core/services/error.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errors = inject(ErrorService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg = err.status === 0
        ? 'Network error — please check your connection.'
        : `Request failed (${err.status}): ${err.statusText || 'Unknown error'}`;
      errors.push(msg);
      return throwError(() => err);
    }),
  );
};
