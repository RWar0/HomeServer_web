import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard = (allowedRoles: string | string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (authService.hasAnyRole(rolesToCheck)) {
      return true;
    }

    return router.createUrlTree(['/dashboard'], {
      queryParams: { forbidden: 'true', redirected_from: state.url },
    });
  };
};
