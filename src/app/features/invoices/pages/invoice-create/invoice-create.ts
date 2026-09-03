import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { InvoiceService } from '../../service/service';
import { Invoice, InvoiceType } from '../../models/invoice.model';
import { InvoiceRequest } from '../../models/invoice-request.model';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './invoice-create.html',
  styleUrl: './invoice-create.scss'
})
export class InvoiceCreate implements OnInit {

  ngOnInit(): void {
    this.onTypeChange();
  }

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);

  readonly invoiceTypes = [
    {
      value: 'NACIONAL' as InvoiceType,
      label: 'Nacional'
    },
    {
      value: 'EXPORTACION' as InvoiceType,
      label: 'Exportación'
    },
    {
      value: 'GUBERNAMENTAL' as InvoiceType,
      label: 'Gubernamental'
    }
  ];

  invoiceForm = this.fb.nonNullable.group({
    type: [
      'NACIONAL' as InvoiceType,
      Validators.required
    ],

    subtotal: [
      0,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    customsCode: ['']
  });

  isLoading = false;
  errorMessage = '';

  onTypeChange(): void {
    const type = this.invoiceForm.controls.type.value;
    const customsCodeControl =
      this.invoiceForm.controls.customsCode;

    if (type === 'EXPORTACION') {
      customsCodeControl.setValidators([
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]+$/),
        Validators.maxLength(20)
      ]);
    } else {
      customsCodeControl.clearValidators();
      customsCodeControl.reset('');
    }

    customsCodeControl.updateValueAndValidity();
  }

  cancel(): void {
    this.router.navigate(['/invoices']);
  }

 createInvoice(): void {
  if (this.invoiceForm.invalid) {
    this.invoiceForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  const formValue = this.invoiceForm.getRawValue();

  const request: InvoiceRequest = {
    type: formValue.type,
    subtotal: formValue.subtotal
  };

  if (formValue.type === 'EXPORTACION') {
    request.customsCode = formValue.customsCode.trim();
  }

  this.invoiceService.createInvoice(request).subscribe({
    next: (invoice) => {
      this.isLoading = false;

      this.router.navigate([
        '/invoices',
        invoice.id
      ]);
    },

    error: (error) => {
      console.error('Error creando factura:', error);

      this.isLoading = false;

      if (error.status === 400) {
        this.errorMessage =
          error?.error?.message ??
          'Los datos ingresados no son válidos.';
        return;
      }

      if (error.status === 403) {
        this.errorMessage =
          'No tienes permisos para crear facturas.';
        return;
      }

      this.errorMessage =
        'No fue posible crear la factura.';
    }
  });
}
goToInvoices(): void {
  this.router.navigate(['/invoices']);
}

}