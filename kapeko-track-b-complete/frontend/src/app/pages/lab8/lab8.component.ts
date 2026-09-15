// lab8.component.ts — Track B (Angular)
// Lab 8: Recommendation Engine

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { RecommendationsComponent } from '../../components/recommendations/recommendations.component';

@Component({
  selector: 'app-lab8',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RecommendationsComponent],
  template: `
    <nav class="nav">
      <a routerLink="/" class="brand">☕ Kape Ko</a>
      <div class="links">
        <a routerLink="/lab3">Lab 3</a>
        <a routerLink="/lab4">Lab 4</a>
        <a routerLink="/lab5">Lab 5</a>
        <a routerLink="/lab6">Lab 6</a>
        <a routerLink="/lab7">Lab 7</a>
        <a routerLink="/lab8" class="active">Lab 8</a>
      </div>
    </nav>
    <main class="page">
      <p class="eyebrow">Personalized discovery</p>
      <h1>Lab 8 - Recommendation Engine</h1>
      <p class="intro">Choose a product and the engine will find similar coffees using vector similarity.</p>

      <section class="chooser">
        <label for="product">Recommend from</label>
        <select id="product" [(ngModel)]="selectedId" (change)="selectProduct()">
          <option *ngFor="let product of products" [value]="product.id">
            {{ product.name }}
          </option>
        </select>
      </section>

      <p *ngIf="loading" class="status">Loading products...</p>
      <p *ngIf="error" class="error">{{ error }}</p>
      <app-recommendations *ngIf="selectedId && !loading" [productId]="selectedId" />
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100vh; background:#FAFAF9; color:#1C1917; }
    .nav { height:56px; padding:0 24px; display:flex; align-items:center; justify-content:space-between; background:#1C1917; }
    .brand, .links a { color:#fff; text-decoration:none; }
    .brand { font-size:18px; font-weight:700; }
    .links { display:flex; gap:18px; }
    .links a { color:#A8A29E; font-size:13px; }
    .links a.active, .links a:hover { color:#F59E0B; }
    .page { max-width:760px; margin:0 auto; padding:64px 24px; }
    .eyebrow { color:#D97706; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
    h1 { margin:8px 0; font-size:38px; font-weight:700; }
    .intro { color:#78716C; line-height:1.6; margin-bottom:28px; }
    .chooser { background:#fff; border:1px solid #E7E5E4; border-radius:12px; padding:18px; }
    label { display:block; color:#78716C; font-size:12px; margin-bottom:8px; }
    select { width:100%; padding:12px; border:1px solid #D6D3D1; border-radius:8px; color:#1C1917; background:#fff; font-size:14px; }
    .status, .error { margin-top:20px; color:#78716C; }
    .error { color:#DC2626; }
  `]
})
export class Lab8Component implements OnInit {
  products: Product[] = [];
  selectedId = '';
  loading = true;
  error = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products;
        this.selectedId = products[0]?.id || '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Cannot load products. Make sure the Spring Boot backend is running.';
        this.loading = false;
      }
    });
  }

  selectProduct() {}
}
