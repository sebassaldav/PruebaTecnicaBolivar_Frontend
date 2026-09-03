import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { InvoiceService, InvoicePage } from './service';
import { environment } from '../../../../environments/environment.development';
import { Invoice } from '../models/invoice.model';
import { InvoiceRequest } from '../models/invoice-request.model';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;

  const mockInvoice: Invoice = {
    id: 1,
    consecutive: 'FAC-001',
    customsCode: null,
    type: 'NACIONAL',
    subtotal: 100,
    iva: 19,
    withholding: 0,
    total: 119,
    totalInWords: 'ciento diecinueve pesos',
    createdAt: '2026-01-01T00:00:00Z',
    createdBy: 'user'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch a page of invoices', () => {
    const mockPage: InvoicePage = {
      content: [mockInvoice],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    };

    let result: InvoicePage | undefined;
    service.getInvoices(0, 10, '').subscribe(res => (result = res));

    const req = httpMock.expectOne(
      req => req.url === `${environment.apiUrl}/invoices`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageNumber')).toBe('0');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ data: mockPage, ok: true, message: 'ok' });

    expect(result).toEqual(mockPage);
  });

  it('should include the search param when provided', () => {
    service.getInvoices(0, 10, 'FAC-001').subscribe();

    const req = httpMock.expectOne(
      req => req.url === `${environment.apiUrl}/invoices`
    );
    expect(req.request.params.get('search')).toBe('FAC-001');
    req.flush({ data: { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 }, ok: true, message: 'ok' });
  });

  it('should fetch an invoice by id', () => {
    let result: Invoice | undefined;
    service.getInvoiceById(1).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/invoices/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockInvoice, ok: true, message: 'ok' });

    expect(result).toEqual(mockInvoice);
  });

  it('should create an invoice', () => {
    const request: InvoiceRequest = { type: 'NACIONAL', subtotal: 100 };

    let result: Invoice | undefined;
    service.createInvoice(request).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/invoices`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ data: mockInvoice, ok: true, message: 'ok' });

    expect(result).toEqual(mockInvoice);
  });

  it('should update an invoice', () => {
    const request: InvoiceRequest = { type: 'NACIONAL', subtotal: 200 };

    let result: Invoice | undefined;
    service.updateInvoice(1, request).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/invoices/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ data: mockInvoice, ok: true, message: 'ok' });

    expect(result).toEqual(mockInvoice);
  });

  it('should delete an invoice', () => {
    let completed = false;
    service.deleteInvoice(1).subscribe(() => (completed = true));

    const req = httpMock.expectOne(`${environment.apiUrl}/invoices/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: undefined, ok: true, message: 'ok' });

    expect(completed).toBe(true);
  });
});
