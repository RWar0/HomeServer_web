import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthRefreshService {
  private readonly authService = inject(AuthService);

  private isRefreshing = false;

  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  refresh(): Observable<string> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
      ) as Observable<string>;
    }

    this.isRefreshing = true;

    this.refreshTokenSubject.next(null);

    return this.authService.refresh().pipe(
      switchMap((response) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.accessToken);

        return [response.accessToken];
      }),

      catchError((error) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        this.authService.forceLogout();

        return throwError(() => error);
      }),
    );
  }
}
