import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Auth } from './auth';
import { environment } from '../../../../environments/environment.development';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and persist the token and user in localStorage', () => {
    const credentials = { email: 'a@a.com', password: '1234' };
    const authData = { token: 'abc123', email: 'a@a.com', roles: ['ROLE_OPERADOR'] };

    let result: typeof authData | undefined;
    service.login(credentials).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: authData, ok: true, message: 'ok' });

    expect(result).toEqual(authData);
    expect(localStorage.getItem('token')).toBe('abc123');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({
      email: 'a@a.com',
      roles: ['ROLE_OPERADOR']
    });
  });

  it('should remove the token and user on logout', () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('user', JSON.stringify({ email: 'a@a.com', roles: [] }));

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should return the stored token', () => {
    localStorage.setItem('token', 'xyz');
    expect(service.getToken()).toBe('xyz');
  });

  it('should return null when there is no token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return the current user when present', () => {
    localStorage.setItem('user', JSON.stringify({ email: 'a@a.com', roles: ['ROLE_AUDITOR'] }));
    expect(service.getCurrentUser()).toEqual({ email: 'a@a.com', roles: ['ROLE_AUDITOR'] });
  });

  it('should return null when there is no user', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should report authenticated true when a token exists', () => {
    localStorage.setItem('token', 'xyz');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should report authenticated false when the token is missing', () => {
    expect(service.isAuthenticated()).toBe(false);
  });
});
