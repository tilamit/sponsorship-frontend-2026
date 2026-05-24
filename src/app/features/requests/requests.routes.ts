import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/request-list/request-list.component')
      .then(m => m.RequestListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/request-form/request-form.component')
      .then(m => m.RequestFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/request-form/request-form.component')
      .then(m => m.RequestFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/request-detail/request-detail.component')
      .then(m => m.RequestDetailComponent)
  }
];
