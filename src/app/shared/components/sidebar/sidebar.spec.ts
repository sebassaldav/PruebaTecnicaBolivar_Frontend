import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { Sidebar } from './sidebar';
import { Auth } from '../../../core/auth/services/auth';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let authSpy: { getCurrentUser: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authSpy = { getCurrentUser: vi.fn().mockReturnValue(null) };

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should identify an auditor user', () => {
    authSpy.getCurrentUser.mockReturnValue({ email: 'a@a.com', roles: ['ROLE_AUDITOR'] });
    expect(component.isAuditor()).toBe(true);
    expect(component.isOperator()).toBe(false);
  });

  it('should identify an operator user', () => {
    authSpy.getCurrentUser.mockReturnValue({ email: 'a@a.com', roles: ['ROLE_OPERADOR'] });
    expect(component.isOperator()).toBe(true);
    expect(component.isAuditor()).toBe(false);
  });

  it('should return false for role checks when there is no user', () => {
    expect(component.isAuditor()).toBe(false);
    expect(component.isOperator()).toBe(false);
  });
});
