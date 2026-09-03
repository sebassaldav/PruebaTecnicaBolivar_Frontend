import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { InvoiceCreate } from './invoice-create';
import { InvoiceService } from '../../service/service';
import { Invoice } from '../../models/invoice.model';

describe('InvoiceCreate', () => {
  let component: InvoiceCreate;
  let fixture: ComponentFixture<InvoiceCreate>;
  let invoiceServiceSpy: { createInvoice: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

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
    invoiceServiceSpy = { createInvoice: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [InvoiceCreate],
      providers: [
        { provide: InvoiceService, useValue: invoiceServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.invoiceForm.controls.type.value).toBe('NACIONAL');
    expect(component.invoiceForm.controls.subtotal.value).toBe(0);
    expect(component.invoiceForm.controls.customsCode.value).toBe('');
  });

  describe('onTypeChange', () => {
    it('should not require customsCode when type is NACIONAL', () => {
      component.invoiceForm.controls.type.setValue('NACIONAL');
      component.onTypeChange();

      expect(component.invoiceForm.controls.customsCode.valid).toBe(true);
    });

    it('should require customsCode when type is EXPORTACION', () => {
      component.invoiceForm.controls.type.setValue('EXPORTACION');
      component.onTypeChange();

      const customsCodeControl = component.invoiceForm.controls.customsCode;
      customsCodeControl.setValue('');

      expect(customsCodeControl.hasError('required')).toBe(true);
    });

    it('should reject customsCode with invalid characters', () => {
      component.invoiceForm.controls.type.setValue('EXPORTACION');
      component.onTypeChange();

      const customsCodeControl = component.invoiceForm.controls.customsCode;
      customsCodeControl.setValue('ABC-123');

      expect(customsCodeControl.hasError('pattern')).toBe(true);
    });

    it('should reject customsCode longer than 20 characters', () => {
      component.invoiceForm.controls.type.setValue('EXPORTACION');
      component.onTypeChange();

      const customsCodeControl = component.invoiceForm.controls.customsCode;
      customsCodeControl.setValue('A'.repeat(21));

      expect(customsCodeControl.hasError('maxlength')).toBe(true);
    });

    it('should clear validators and reset value when switching back from EXPORTACION', () => {
      component.invoiceForm.controls.type.setValue('EXPORTACION');
      component.onTypeChange();
      component.invoiceForm.controls.customsCode.setValue('ABC123');

      component.invoiceForm.controls.type.setValue('GUBERNAMENTAL');
      component.onTypeChange();

      expect(component.invoiceForm.controls.customsCode.value).toBe('');
      expect(component.invoiceForm.controls.customsCode.valid).toBe(true);
    });
  });

  describe('createInvoice', () => {
    it('should not call the service when the form is invalid', () => {
      component.invoiceForm.controls.subtotal.setValue(0);

      component.createInvoice();

      expect(invoiceServiceSpy.createInvoice).not.toHaveBeenCalled();
      expect(component.invoiceForm.controls.subtotal.touched).toBe(true);
    });

    it('should call the service and navigate to the invoice detail on success', () => {
      invoiceServiceSpy.createInvoice.mockReturnValue(of(mockInvoice));

      component.invoiceForm.controls.subtotal.setValue(100);
      component.createInvoice();

      expect(invoiceServiceSpy.createInvoice).toHaveBeenCalledWith({
        type: 'NACIONAL',
        subtotal: 100
      });
      expect(component.isLoading).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/invoices', mockInvoice.id]);
    });

    it('should include customsCode when type is EXPORTACION', () => {
      invoiceServiceSpy.createInvoice.mockReturnValue(of(mockInvoice));

      component.invoiceForm.controls.type.setValue('EXPORTACION');
      component.onTypeChange();
      component.invoiceForm.controls.subtotal.setValue(50);
      component.invoiceForm.controls.customsCode.setValue('ABC123');

      component.createInvoice();

      expect(invoiceServiceSpy.createInvoice).toHaveBeenCalledWith({
        type: 'EXPORTACION',
        subtotal: 50,
        customsCode: 'ABC123'
      });
    });

    it('should set isLoading false after the request completes', () => {
      invoiceServiceSpy.createInvoice.mockReturnValue(of(mockInvoice));

      component.invoiceForm.controls.subtotal.setValue(100);
      component.createInvoice();

      expect(invoiceServiceSpy.createInvoice).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should show a validation error message on 400 response with message', () => {
      invoiceServiceSpy.createInvoice.mockReturnValue(
        throwError(() => ({ status: 400, error: { message: 'Subtotal inválido' } }))
      );

      component.invoiceForm.controls.subtotal.setValue(100);
      component.createInvoice();

      expect(component.errorMessage).toBe('Subtotal inválido');
      expect(component.isLoading).toBe(false);
    });

    it('should show a default validation error message on 400 response without message', () => {
      invoiceServiceSpy.createInvoice.mockReturnValue(
        throwError(() => ({ status: 400 }))
      );

      component.invoiceForm.controls.subtotal.setValue(100);
      component.createInvoice();

      expect(component.errorMessage).toBe('Los datos ingresados no son válidos.');
    });

    it('should show a permissions error message on 403 response', () => {
      invoiceServiceSpy.createInvoice.mockReturnValue(
        throwError(() => ({ status: 403 }))
      );

      component.invoiceForm.controls.subtotal.setValue(100);
      component.createInvoice();

      expect(component.errorMessage).toBe('No tienes permisos para crear facturas.');
    });

    it('should show a generic error message on other errors', () => {
      invoiceServiceSpy.createInvoice.mockReturnValue(
        throwError(() => ({ status: 500 }))
      );

      component.invoiceForm.controls.subtotal.setValue(100);
      component.createInvoice();

      expect(component.errorMessage).toBe('No fue posible crear la factura.');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('navigation', () => {
    it('should navigate to /invoices on cancel', () => {
      component.cancel();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/invoices']);
    });

    it('should navigate to /invoices on goToInvoices', () => {
      component.goToInvoices();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/invoices']);
    });
  });
});
