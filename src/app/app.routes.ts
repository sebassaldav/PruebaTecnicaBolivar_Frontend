import { Routes } from '@angular/router';
import { InvoiceCreate } from './features/invoices/pages/invoice-create/invoice-create';

import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

import { Login } from './features/login/login';
import { Home } from './features/home/home';
import { Layout } from './shared/components/layout/layout';
import { InvoiceList } from './features/invoices/pages/invoice-list/invoice-list';
import { roleGuard } from './core/auth/guards/role.guard';
import { Dashboard } from './features/dashboard/dashboard';
import { InvoiceDetail } from './features/invoices/pages/invoice-detail/invoice-detail';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'invoices',
        component: InvoiceList,
      },
      {
        path: 'invoices/new',
        component: InvoiceCreate,
        canActivate: [roleGuard],
        data: {
          roles: ['ROLE_OPERADOR'],
        },
      },
      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [roleGuard],
        data: {
          roles: ['ROLE_AUDITOR'],
        },
      },
      {
        path: 'invoices/:id',
        component: InvoiceDetail,
      },
    ],
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];
