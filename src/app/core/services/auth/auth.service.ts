import { computed, inject, Injectable, signal } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import {
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
} from '../../models/auth.model';
import { CurrentUser } from '../../models/user.model';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { UserService } from '../users/user.service';
import { displayApiError } from '../../helpers/error-handler';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly userService = inject(UserService);

  private readonly currentUser = signal<CurrentUser | null>(null);

  readonly user = this.currentUser.asReadonly();

  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.apiService
      .post<LoginResponse>('auth/login', credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.tokenService.setToken(response.accessToken);
        }),
        switchMap((response) =>
          this.userService.getMyProfile().pipe(
            tap((myUser) => {
              this.currentUser.set(myUser);
              this.router.navigate(['dashboard']);
            }),
            map(() => response),
          ),
        ),
      );
  }

  refresh(isInit: boolean = false): Observable<RefreshResponse> {
    return this.apiService
      .post<RefreshResponse>(
        'auth/refresh',
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => {
          this.tokenService.setToken(response.accessToken);
        }),
        catchError((err) => {
          this.tokenService.clearToken();
          this.currentUser.set(null);
          if (!isInit) {
            this.router.navigate(['/login'], {
              queryParams: { expired: 'true' },
            });
            setTimeout(() => displayApiError(err), 0);
          }
          return throwError(() => err);
        }),
      );
  }

  logout(): Observable<LogoutResponse> {
    return this.apiService
      .post<LogoutResponse>(
        'auth/logout',
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.forceLogout();
        }),
        catchError(() => {
          this.forceLogout();
          return of({} as LogoutResponse);
        }),
      );
  }

  forceLogout(): void {
    this.tokenService.clearToken();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  initializeAuth(): Observable<CurrentUser | null> {
    return this.refresh(true).pipe(
      switchMap(() => this.userService.getMyProfile()),
      tap((myUser) => {
        this.currentUser.set(myUser);
      }),
      catchError(() => {
        this.tokenService.clearToken();
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }
}
