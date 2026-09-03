import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardService } from './dashboard';
import { environment } from '../../../../environments/environment.development';
import { TotalFacturas } from '../models/total-facturas.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch the totals by type', () => {
    const mockTotals: TotalFacturas[] = [
      { type: 'NACIONAL', total: 1000 }
    ];

    let result: TotalFacturas[] | undefined;
    service.getTotalsByType().subscribe(res => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockTotals, ok: true, message: 'ok' });

    expect(result).toEqual(mockTotals);
  });
});
