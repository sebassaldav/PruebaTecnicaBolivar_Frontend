import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment.development';
import { Invoice } from '../models/invoice.model';
import { InvoiceRequest } from '../models/invoice-request.model';

interface ApiResponse<T> {
  data: T;
  ok: boolean;
  message: string;
}

export interface InvoicePage {
  content: Invoice[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  getInvoices(
    pageNumber: number = 0,
    pageSize: number = 10,
    search: string = ''
  ): Observable<InvoicePage> {

    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiResponse<InvoicePage>>(this.apiUrl, { params })
      .pipe(
        map(response => response.data)
      );
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http
      .get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  createInvoice(request: InvoiceRequest): Observable<Invoice> {
    return this.http
      .post<ApiResponse<Invoice>>(this.apiUrl, request)
      .pipe(
        map(response => response.data)
      );
  }

  updateInvoice(
    id: number,
    request: InvoiceRequest
  ): Observable<Invoice> {
    return this.http
      .put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`, request)
      .pipe(
        map(response => response.data)
      );
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => undefined)
      );
  }
}