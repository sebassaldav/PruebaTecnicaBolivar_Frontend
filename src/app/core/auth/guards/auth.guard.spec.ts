import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { vi } from 'vitest';

import { authGuard } from './auth.guard';
import { Auth } from '../services/auth';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authSpy: { isAuthenticated: ReturnType<typeof vi.fn> };
  let routerSpy: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = { isAuthenticated: vi.fn() };
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

  it('should allow activation when the user is authenticated', () => {
    authSpy.isAuthenticated.mockReturnValue(true);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(true);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /home when the user is not authenticated', () => {
    authSpy.isAuthenticated.mockReturnValue(false);
    const urlTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(urlTree);

    const result = executeGuard({} as any, {} as any);

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/home']);
    expect(result).toBe(urlTree);
  });
});
