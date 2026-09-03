import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { InvoiceService } from '../../service/service';
import { Invoice } from '../../models/invoice.model';
import { Auth } from '../../../../core/auth/services/auth';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
  RouterLink,
  DatePipe,
  DecimalPipe
],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.scss'
})
export class InvoiceDetail implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly cdr = inject(ChangeDetectorRef);

  invoice: Invoice | null = null;

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');

  const id = Number(idParam);

  if (!id || id <= 0) {
    this.errorMessage = 'El identificador de la factura no es válido.';
    return;
  }

  this.loadInvoice(id);
}

  loadInvoice(id: number): void {
  this.loading = true;
  this.errorMessage = '';

  this.invoiceService.getInvoiceById(id).subscribe({
    next: (invoice) => {
      this.invoice = invoice;
      this.loading = false;

      this.cdr.detectChanges();
    },

    error: (error) => {

      this.loading = false;

      if (error.status === 404) {
        this.errorMessage = 'La factura no fue encontrada.';
        return;
      }

      if (error.status === 403) {
        this.errorMessage =
          'No tienes permisos para consultar esta factura.';
        return;
      }

      this.errorMessage =
        'No fue posible cargar la información de la factura.';
    }
  });
}

  getInvoiceTypeLabel(type: Invoice['type']): string {
    switch (type) {
      case 'NACIONAL':
        return 'Nacional';

      case 'EXPORTACION':
        return 'Exportación';

      case 'GUBERNAMENTAL':
        return 'Gubernamental';

      default:
        return type;
    }
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }
}