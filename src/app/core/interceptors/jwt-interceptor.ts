import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../auth/services/auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(Auth);
  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const authenticateRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(authenticateRequest);
};
