import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService } from './services/dashboard';
import { TotalFacturas } from './models/total-facturas.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  totals: TotalFacturas[] = [];

  loading = false;
  errorMessage = '';

  chartType: 'bar' = 'bar';

  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Total facturado',
        data: [],
      },
    ],
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getTotalsByType().subscribe({
      next: (response) => {

  this.totals = response;

  this.chartData = {
    labels: [
      'Nacional',
      'Exportación',
      'Gubernamental'
    ],

    datasets: [
      {
        label: 'Total facturado',
        data: [
          this.getTotalByType('NACIONAL'),
          this.getTotalByType('EXPORTACION'),
          this.getTotalByType('GUBERNAMENTAL')
        ]
      }
    ]
  };

  this.loading = false;
  this.cdr.detectChanges();
},

      error: (error) => {
  this.loading = false;

  if (error.status === 403) {
    this.errorMessage =
      'No tienes permisos para consultar el dashboard.';
  } else {
    this.errorMessage =
      'No fue posible cargar la información del dashboard.';
  }

  this.cdr.detectChanges();
},
    });
  }

  getTypeLabel(type: TotalFacturas['type']): string {
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
  

  getTotalByType(
  type: TotalFacturas['type']
): number {

  return this.totals.find(
    item => item.type === type
  )?.total ?? 0;
}

}
