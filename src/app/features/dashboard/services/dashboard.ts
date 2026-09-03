import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment.development';
import { TotalFacturas } from '../models/total-facturas.model';

interface ApiResponse<T> {
  data: T;
  ok: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getTotalsByType(): Observable<TotalFacturas[]> {

    return this.http
      .get<ApiResponse<TotalFacturas[]>>(this.apiUrl)
      .pipe(
        map(response => response.data)
      );
  }
}