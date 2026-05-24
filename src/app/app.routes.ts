import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component')
      .then(m => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'requests' },
      {
        path: 'requests',
        loadChildren: () => import('./features/requests/requests.routes')
          .then(m => m.routes)
      },
      {
        path: 'workflow',
        loadChildren: () => import('./features/workflow/workflow.routes')
          .then(m => m.routes)
      },
      {
        path: 'admin',
        canActivate: [roleGuard('SystemAdmin')],
        loadChildren: () => import('./features/admin/admin.routes')
          .then(m => m.routes)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
