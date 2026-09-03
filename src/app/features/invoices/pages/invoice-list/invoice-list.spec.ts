import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { InvoiceList } from './invoice-list';
import { InvoiceService, InvoicePage } from '../../service/service';
import { Auth } from '../../../../core/auth/services/auth';
import { Invoice } from '../../models/invoice.model';

describe('InvoiceList', () => {
  let component: InvoiceList;
  let fixture: ComponentFixture<InvoiceList>;
  let invoiceServiceSpy: { getInvoices: ReturnType<typeof vi.fn> };
  let authSpy: { getCurrentUser: ReturnType<typeof vi.fn> };

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

  const mockPage: InvoicePage = {
    content: [mockInvoice],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0
  };

  beforeEach(async () => {
    invoiceServiceSpy = { getInvoices: vi.fn().mockReturnValue(of(mockPage)) };
    authSpy = { getCurrentUser: vi.fn().mockReturnValue(null) };

    await TestBed.configureTestingModule({
      imports: [InvoiceList],
      providers: [
        provideRouter([]),
        { provide: InvoiceService, useValue: invoiceServiceSpy },
        { provide: Auth, useValue: authSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load invoices on init', () => {
    component.ngOnInit();

    expect(invoiceServiceSpy.getInvoices).toHaveBeenCalledWith(0, 10, '');
    expect(component.invoices).toEqual([mockInvoice]);
    expect(component.totalElements).toBe(1);
    expect(component.totalPages).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should set an error message when loading invoices fails', () => {
    invoiceServiceSpy.getInvoices.mockReturnValue(throwError(() => ({ status: 500 })));

    component.loadInvoices();

    expect(component.errorMessage).toBe('No fue posible cargar las facturas.');
    expect(component.loading).toBe(false);
  });

  it('should reset the page and reload when searching', () => {
    component.page = 3;
    component.search = 'FAC';

    component.searchInvoices();

    expect(component.page).toBe(0);
    expect(invoiceServiceSpy.getInvoices).toHaveBeenCalledWith(0, 10, 'FAC');
  });

  it('should clear the search term and reload', () => {
    component.page = 2;
    component.search = 'FAC';

    component.clearSearch();

    expect(component.search).toBe('');
    expect(component.page).toBe(0);
  });

  it('should go to the previous page when possible', () => {
    component.page = 2;

    component.previousPage();

    expect(component.page).toBe(1);
  });

  it('should not go before the first page', () => {
    component.page = 0;

    component.previousPage();

    expect(component.page).toBe(0);
  });

  it('should go to the next page when possible', () => {
    component.page = 0;
    component.totalPages = 3;

    component.nextPage();

    expect(component.page).toBe(1);
  });

  it('should not go past the last page', () => {
    component.page = 2;
    component.totalPages = 3;

    component.nextPage();

    expect(component.page).toBe(2);
  });

  it('should identify an operator user', () => {
    authSpy.getCurrentUser.mockReturnValue({ email: 'a@a.com', roles: ['ROLE_OPERADOR'] });
    expect(component.isOperator()).toBe(true);
    expect(component.isAuditor()).toBe(false);
  });

  it('should identify an auditor user', () => {
    authSpy.getCurrentUser.mockReturnValue({ email: 'a@a.com', roles: ['ROLE_AUDITOR'] });
    expect(component.isAuditor()).toBe(true);
    expect(component.isOperator()).toBe(false);
  });

  it('should return false for role checks when there is no user', () => {
    authSpy.getCurrentUser.mockReturnValue(null);
    expect(component.isOperator()).toBe(false);
    expect(component.isAuditor()).toBe(false);
  });

  it('should return the correct type labels', () => {
    expect(component.getInvoiceTypeLabel('NACIONAL')).toBe('Nacional');
    expect(component.getInvoiceTypeLabel('EXPORTACION')).toBe('Exportación');
    expect(component.getInvoiceTypeLabel('GUBERNAMENTAL')).toBe('Gubernamental');
  });
});
