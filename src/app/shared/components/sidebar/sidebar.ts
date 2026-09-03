import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Auth } from '../../../core/auth/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

  private readonly auth = inject(Auth);

  isAuditor(): boolean {
    return this.auth.getCurrentUser()?.roles.includes('ROLE_AUDITOR') ?? false;
  }

  isOperator(): boolean {
    return this.auth.getCurrentUser()?.roles.includes('ROLE_OPERADOR') ?? false;
  }
}