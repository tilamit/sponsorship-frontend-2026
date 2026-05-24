import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'manager',
    canActivate: [roleGuard('Manager', 'SystemAdmin')],
    loadComponent: () => import('./pages/manager-queue/manager-queue.component')
      .then(m => m.ManagerQueueComponent)
  },
  {
    path: 'finance',
    canActivate: [roleGuard('FinanceAdmin', 'SystemAdmin')],
    loadComponent: () => import('./pages/finance-queue/finance-queue.component')
      .then(m => m.FinanceQueueComponent)
  }
];
