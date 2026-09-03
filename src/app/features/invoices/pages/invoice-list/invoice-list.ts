import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Auth } from '../../../../core/auth/services/auth';

import {
  InvoiceService,
  InvoicePage
} from '../../service/service';

import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  imports: [ CommonModule,
    RouterLink,
    FormsModule],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
})
export class InvoiceList implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly auth = inject(Auth);
  private readonly cdr = inject(ChangeDetectorRef);

  invoices: Invoice[] = [];

  page = 0;
  pageSize = 10;

  totalElements = 0;
  totalPages = 0;

  search = '';

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadInvoices();
  }

  isOperator(): boolean {
    return this.auth.getCurrentUser()
      ?.roles.includes('ROLE_OPERADOR') ?? false;
  }

  isAuditor(): boolean {
    return this.auth.getCurrentUser()
      ?.roles.includes('ROLE_AUDITOR') ?? false;
  }

 loadInvoices(): void {
  this.loading = true;
  this.errorMessage = '';

  this.invoiceService
    .getInvoices(this.page, this.pageSize, this.search)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: InvoicePage) => {
        this.invoices = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
      },
      error: () => {
        this.errorMessage = 'No fue posible cargar las facturas.';
      }
    });
}

  searchInvoices(): void {
    this.page = 0;
    this.loadInvoices();
  }

  clearSearch(): void {
    this.search = '';
    this.page = 0;
    this.loadInvoices();
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadInvoices();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadInvoices();
    }
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

}