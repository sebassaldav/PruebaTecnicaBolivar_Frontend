import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { InvoiceDetail } from './invoice-detail';
import { InvoiceService } from '../../service/service';
import { Invoice } from '../../models/invoice.model';

describe('InvoiceDetail', () => {
  let component: InvoiceDetail;
  let fixture: ComponentFixture<InvoiceDetail>;
  let invoiceServiceSpy: { getInvoiceById: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let activatedRouteStub: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

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

  beforeEach(async () => {
    invoiceServiceSpy = { getInvoiceById: vi.fn().mockReturnValue(of(mockInvoice)) };
    routerSpy = { navigate: vi.fn() };
    activatedRouteStub = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue('1') } }
    };

    await TestBed.configureTestingModule({
      imports: [InvoiceDetail],
      providers: [
        provideRouter([]),
        { provide: InvoiceService, useValue: invoiceServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the invoice when the id is valid', () => {
    component.ngOnInit();

    expect(invoiceServiceSpy.getInvoiceById).toHaveBeenCalledWith(1);
    expect(component.invoice).toEqual(mockInvoice);
    expect(component.loading).toBe(false);
  });

  it('should show an error message when the id is invalid', () => {
    activatedRouteStub.snapshot.paramMap.get.mockReturnValue('abc');

    component.ngOnInit();

    expect(component.errorMessage).toBe('El identificador de la factura no es válido.');
    expect(invoiceServiceSpy.getInvoiceById).not.toHaveBeenCalled();
  });

  it('should show a not found message on 404', () => {
    invoiceServiceSpy.getInvoiceById.mockReturnValue(throwError(() => ({ status: 404 })));

    component.ngOnInit();

    expect(component.errorMessage).toBe('La factura no fue encontrada.');
  });

  it('should show a permissions message on 403', () => {
    invoiceServiceSpy.getInvoiceById.mockReturnValue(throwError(() => ({ status: 403 })));

    component.ngOnInit();

    expect(component.errorMessage).toBe('No tienes permisos para consultar esta factura.');
  });

  it('should show a generic message on other errors', () => {
    invoiceServiceSpy.getInvoiceById.mockReturnValue(throwError(() => ({ status: 500 })));

    component.ngOnInit();

    expect(component.errorMessage).toBe('No fue posible cargar la información de la factura.');
  });

  it('should return the correct type labels', () => {
    expect(component.getInvoiceTypeLabel('NACIONAL')).toBe('Nacional');
    expect(component.getInvoiceTypeLabel('EXPORTACION')).toBe('Exportación');
    expect(component.getInvoiceTypeLabel('GUBERNAMENTAL')).toBe('Gubernamental');
  });

  it('should navigate back to /invoices', () => {
    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/invoices']);
  });
});
