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
    path: 'lab5',
    loadComponent: () =>
      import('./pages/product-list/product-list.component')
        .then(m => m.ProductListComponent),
  },
  {
    path: 'lab6',
    loadComponent: () =>
      import('./pages/product-list/product-list.component')
        .then(m => m.ProductListComponent),
  },
  {
    path: 'lab7',
    loadComponent: () =>
      import('./pages/lab7/lab7.component')
        .then(m => m.Lab7Component),
  },
  {
    path: 'lab8',
    loadComponent: () =>
      import('./pages/lab8/lab8.component')
        .then(m => m.Lab8Component),
  },
  {
    path: 'lab9',
    loadComponent: () =>
      import('./pages/lab9/lab9.component')
        .then(m => m.Lab9Component),
  },
  {
    path: 'lab10',
    loadComponent: () =>
      import('./pages/lab10/lab10.component')
        .then(m => m.Lab10Component),
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
