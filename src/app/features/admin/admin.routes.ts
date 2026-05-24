import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sponsorship-types',
    loadComponent: () => import('./pages/sponsorship-types/sponsorship-types.component')
      .then(m => m.SponsorshipTypesComponent)
  }
];
