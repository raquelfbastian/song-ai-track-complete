// app.routes.ts — Track B (Angular)
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list/product-list.component')
        .then(m => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component')
        .then(m => m.ProductDetailComponent),
  },
  {
    path: 'lab3',
    loadComponent: () =>
      import('./pages/lab3/lab3.component')
        .then(m => m.Lab3Component),
  },
  {
    path: 'lab4',
    loadComponent: () =>
      import('./pages/lab4/lab4.component')
        .then(m => m.Lab4Component),
  },
  { path: '**', redirectTo: '' },
];
