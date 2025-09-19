import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'sign/:id',
    loadComponent: () => import('./components/sign-flow.component').then(m => m.SignFlowComponent),
  },
  {
    path: 'developers',
    loadComponent: () => import('./components/developers.component').then(m => m.DevelopersComponent),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];