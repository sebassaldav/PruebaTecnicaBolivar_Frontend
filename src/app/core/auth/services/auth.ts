import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

import { environment } from '../../../../environments/environment.development';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse, AuthData } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthData> {

    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {

        const authData = response.data;

        localStorage.setItem(
          this.TOKEN_KEY,
          authData.token
        );

        localStorage.setItem(
          this.USER_KEY,
          JSON.stringify({
            email: authData.email,
            roles: authData.roles
          })
        );

      }),
      map(response => response.data)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): {
    email: string;
    roles: string[];
  } | null {

    const user = localStorage.getItem(this.USER_KEY);

    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}