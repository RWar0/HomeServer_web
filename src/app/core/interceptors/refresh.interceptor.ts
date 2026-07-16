import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, switchMap, throwError } from 'rxjs';
import { AuthRefreshService } from '../services/auth/auth-refresh.service';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authRefreshService = inject(AuthRefreshService);

  return next(req).pipe(
    catchError((error) => {
      const isLoginRequest = req.url.includes('/auth/login');
      const isRefreshRequest = req.url.includes('/auth/refresh');
      const isProfileRequest = req.url.includes('/users/my-profile');

      if (error.status !== 401 || isLoginRequest || isRefreshRequest || isProfileRequest) {
        return throwError(() => error);
      }

      return authRefreshService.refresh().pipe(
        switchMap((token) => {
          const retryRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });

          return next(retryRequest);
        }),
      );
    }),
  );
};
