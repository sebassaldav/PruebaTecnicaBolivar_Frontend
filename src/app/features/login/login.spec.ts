import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Login } from './login';
import { Auth } from '../../core/auth/services/auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authSpy: { login: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authSpy = { login: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when the form is invalid', () => {
    component.onSubmit();

    expect(authSpy.login).not.toHaveBeenCalled();
    expect(component.loginForm.controls.email.touched).toBe(true);
    expect(component.loginForm.controls.password.touched).toBe(true);
  });

  it('should login and navigate to /home on success', () => {
    authSpy.login.mockReturnValue(of({ email: 'a@a.com', roles: [] }));

    component.loginForm.setValue({ email: 'a@a.com', password: '1234' });
    component.onSubmit();

    expect(authSpy.login).toHaveBeenCalledWith({ email: 'a@a.com', password: '1234' });
    expect(component.isLoading).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should show an error message when login fails', () => {
    authSpy.login.mockReturnValue(throwError(() => ({ status: 401 })));

    component.loginForm.setValue({ email: 'a@a.com', password: 'wrong' });
    component.onSubmit();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe(
      'Usuario o contraseña incorrectos. Valide la información e intente nuevamente'
    );
  });
});
