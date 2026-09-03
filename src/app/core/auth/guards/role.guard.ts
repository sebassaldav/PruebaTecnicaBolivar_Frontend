import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const authService = inject(Auth);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles = route.data['roles'] as string[];

  const hasRole = requiredRoles.some(
    role => user.roles.includes(role)
  );

  if (hasRole) {
    return true;
  }

  return router.createUrlTree(['/403']);
};