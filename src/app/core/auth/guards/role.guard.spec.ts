import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { vi } from 'vitest';

import { roleGuard } from './role.guard';
import { Auth } from '../services/auth';

describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

  let authSpy: { getCurrentUser: ReturnType<typeof vi.fn> };
  let routerSpy: { createUrlTree: ReturnType<typeof vi.fn> };

  const buildRoute = (roles: string[]): ActivatedRouteSnapshot =>
    ({ data: { roles } }) as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    authSpy = { getCurrentUser: vi.fn() };
    routerSpy = { createUrlTree: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should redirect to /login when there is no current user', () => {
    authSpy.getCurrentUser.mockReturnValue(null);
    const urlTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(urlTree);

    const result = executeGuard(buildRoute(['ROLE_AUDITOR']), {} as any);

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(urlTree);
  });

  it('should allow activation when the user has one of the required roles', () => {
    authSpy.getCurrentUser.mockReturnValue({ email: 'a@a.com', roles: ['ROLE_OPERADOR'] });

    const result = executeGuard(buildRoute(['ROLE_OPERADOR', 'ROLE_AUDITOR']), {} as any);

    expect(result).toBe(true);
  });

  it('should redirect to /403 when the user lacks the required role', () => {
    authSpy.getCurrentUser.mockReturnValue({ email: 'a@a.com', roles: ['ROLE_OPERADOR'] });
    const urlTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(urlTree);

    const result = executeGuard(buildRoute(['ROLE_AUDITOR']), {} as any);

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/403']);
    expect(result).toBe(urlTree);
  });
});
