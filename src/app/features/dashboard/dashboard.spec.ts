import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Dashboard } from './dashboard';
import { DashboardService } from './services/dashboard';
import { TotalFacturas } from './models/total-facturas.model';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let dashboardServiceSpy: { getTotalsByType: ReturnType<typeof vi.fn> };

  const mockTotals: TotalFacturas[] = [
    { type: 'NACIONAL', total: 1000 },
    { type: 'EXPORTACION', total: 500 },
    { type: 'GUBERNAMENTAL', total: 250 }
  ];

  beforeEach(async () => {
    dashboardServiceSpy = { getTotalsByType: vi.fn().mockReturnValue(of(mockTotals)) };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy }
      ]
    })
    .compileComponents();

    // Avoid rendering the chart.js canvas, which is not supported in jsdom.
    TestBed.overrideComponent(Dashboard, { set: { template: '<div></div>' } });

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load totals and build the chart data on init', () => {
    component.ngOnInit();

    expect(dashboardServiceSpy.getTotalsByType).toHaveBeenCalled();
    expect(component.totals).toEqual(mockTotals);
    expect(component.loading).toBe(false);
    expect(component.chartData.datasets[0].data).toEqual([1000, 500, 250]);
  });

  it('should set a permissions error message on 403', () => {
    dashboardServiceSpy.getTotalsByType.mockReturnValue(
      throwError(() => ({ status: 403 }))
    );

    component.loadDashboard();

    expect(component.errorMessage).toBe('No tienes permisos para consultar el dashboard.');
    expect(component.loading).toBe(false);
  });

  it('should set a generic error message on other errors', () => {
    dashboardServiceSpy.getTotalsByType.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );

    component.loadDashboard();

    expect(component.errorMessage).toBe('No fue posible cargar la información del dashboard.');
  });

  it('should return the correct type labels', () => {
    expect(component.getTypeLabel('NACIONAL')).toBe('Nacional');
    expect(component.getTypeLabel('EXPORTACION')).toBe('Exportación');
    expect(component.getTypeLabel('GUBERNAMENTAL')).toBe('Gubernamental');
  });

  it('should return 0 for a type with no recorded total', () => {
    component.totals = [{ type: 'NACIONAL', total: 100 }];
    expect(component.getTotalByType('EXPORTACION')).toBe(0);
  });
});
