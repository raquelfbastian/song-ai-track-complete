// product-list.component.ts — Track B (Angular)
// Lab 5: Kape Ko Storefront — Product Listing Page
// Spartacus-inspired component structure

import { Component, OnInit }       from '@angular/core';
import { CommonModule }            from '@angular/common';
import { RouterModule }            from '@angular/router';
import { ProductService }          from '../../services/product.service';
import { Product }                 from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Nav -->
    <nav class="nav">
      <span class="nav-brand">☕ Kape Ko</span>
      <div class="nav-filters">
        <button *ngFor="let r of roasts"
          [class.active]="filter === r"
          (click)="filter = r"
          class="filter-btn">{{ r }}
        </button>
      </div>
      <div class="nav-links">
        <a routerLink="/lab3">Lab 3</a>
        <a routerLink="/lab4">Lab 4</a>
      </div>
    </nav>

    <!-- Hero -->
    <div class="hero">
      <p class="hero-eyebrow">Single Origin · Farm to Cup · Subscription</p>
      <h1 class="hero-title">Filipino Coffee,<br>Traced to the Farm</h1>
      <p class="hero-sub">Every bag tells you exactly which farm it came from.</p>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="loading">
      <span class="spinner">☕</span>
      <p>Loading catalog from Spring Boot API...</p>
      <code>GET /api/products</code>
    </div>

    <!-- Error -->
    <div *ngIf="error" class="error-box">
      <p class="error-title">Spring Boot not running</p>
      <p class="error-msg">{{ error }}</p>
      <a routerLink="/lab3" class="btn-primary">Go to Lab 3 → Generate catalog first</a>
    </div>

    <!-- Product Grid -->
    <div *ngIf="!loading && !error" class="container">
      <p class="result-count">{{ filteredProducts.length }} products · AI-generated via Spring Boot + LLM API</p>
      <div class="product-grid">
        <a *ngFor="let product of filteredProducts"
          [routerLink]="['/products', product.id]"
          class="product-card">
          <div class="card-image" [ngClass]="roastClass(product.roast)">☕</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="roast-badge" [ngClass]="roastClass(product.roast)">
                {{ product.roast }} Roast
              </span>
              <span class="sku">{{ product.id }}</span>
            </div>
            <h3 class="card-title">{{ product.name }}</h3>
            <p class="card-origin">{{ product.origin }}</p>
            <p *ngIf="product.marketing_hook" class="card-hook">"{{ product.marketing_hook }}"</p>
            <div class="flavor-chips">
              <span *ngFor="let f of product.flavor_notes.slice(0,3)" class="chip">{{ f }}</span>
            </div>
            <div class="card-footer">
              <div class="price">
                <span class="price-sub">₱{{ product.sub_price_php }}</span>
                <span class="price-unit">/mo</span>
              </div>
              <span class="price-one">₱{{ product.price_php }} one-time</span>
            </div>
          </div>
        </a>
      </div>
    </div>

    <!-- Architecture badge -->
    <div class="arch-badge">
      <span class="live-dot">● LIVE</span>
      Spring Boot :8080 → Angular :5173 → LLM API
    </div>
  `,
  styles: [`
    .nav { background:#1C1917; padding:0 24px; height:56px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:10; }
    .nav-brand { font-size:18px; font-weight:700; color:#fff; }
    .nav-filters { display:flex; gap:4px; }
    .filter-btn { padding:6px 14px; border-radius:20px; border:none; background:transparent; color:#78716C; cursor:pointer; font-size:12px; font-weight:600; }
    .filter-btn.active { background:#F59E0B; color:#fff; }
    .nav-links { display:flex; gap:16px; }
    .nav-links a { color:#78716C; text-decoration:none; font-size:13px; }
    .nav-links a:hover { color:#F59E0B; }
    .hero { background:#1C1917; padding:48px 24px; text-align:center; }
    .hero-eyebrow { color:#F59E0B; font-size:11px; font-weight:600; letter-spacing:3px; text-transform:uppercase; margin-bottom:12px; }
    .hero-title { font-size:36px; font-weight:300; color:#fff; margin-bottom:12px; line-height:1.2; }
    .hero-sub { color:#78716C; font-size:14px; }
    .loading, .error-box { text-align:center; padding:48px 24px; }
    .spinner { font-size:32px; display:block; margin-bottom:12px; animation:spin 2s linear infinite; }
    @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    .error-title { color:#DC2626; font-weight:600; margin-bottom:8px; }
    .error-msg { color:#6B7280; font-size:13px; margin-bottom:16px; }
    .btn-primary { background:#F59E0B; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:13px; }
    .container { max-width:780px; margin:0 auto; padding:24px; }
    .result-count { color:#6B7280; font-size:13px; margin-bottom:16px; }
    .product-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .product-card { background:#fff; border:0.5px solid #E7E5E4; border-radius:12px; overflow:hidden; text-decoration:none; display:block; transition:border-color .15s, box-shadow .15s; }
    .product-card:hover { border-color:#FCD34D; box-shadow:0 4px 16px rgba(0,0,0,.08); }
    .card-image { height:80px; display:flex; align-items:center; justify-content:center; font-size:32px; }
    .card-image.light { background:#FEF9F2; }
    .card-image.medium { background:#FEF3C7; }
    .card-image.dark { background:#292524; }
    .card-body { padding:14px; }
    .card-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .roast-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }
    .roast-badge.light { background:#FEF9C3; color:#92400E; }
    .roast-badge.medium { background:#FED7AA; color:#9A3412; }
    .roast-badge.dark { background:#E7E5E4; color:#292524; }
    .sku { font-size:10px; color:#A8A29E; }
    .card-title { font-size:14px; font-weight:600; color:#1C1917; margin-bottom:4px; }
    .card-origin { font-size:11px; color:#A8A29E; margin-bottom:8px; }
    .card-hook { font-size:11px; color:#78716C; font-style:italic; margin-bottom:8px; }
    .flavor-chips { display:flex; gap:4px; flex-wrap:wrap; margin-bottom:12px; }
    .chip { font-size:10px; background:#FEF3C7; color:#92400E; padding:2px 8px; border-radius:20px; }
    .card-footer { display:flex; justify-content:space-between; align-items:center; }
    .price-sub { font-size:16px; font-weight:700; color:#1C1917; }
    .price-unit { font-size:11px; color:#A8A29E; }
    .price-one { font-size:11px; color:#A8A29E; }
    .arch-badge { position:fixed; bottom:16px; left:50%; transform:translateX(-50%); background:rgba(28,25,23,.9); backdrop-filter:blur(8px); color:#A8A29E; font-size:12px; padding:8px 20px; border-radius:20px; display:flex; align-items:center; gap:12px; white-space:nowrap; }
    .live-dot { color:#22C55E; font-weight:700; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[]         = [];
  filteredProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  filter = 'All';
  roasts = ['All', 'Light', 'Medium', 'Dark'];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next:  (products) => {
        this.products = products;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Cannot reach Spring Boot API';
        this.loading = false;
      }
    });
  }

  applyFilter() {
    this.filteredProducts = this.filter === 'All'
      ? this.products
      : this.products.filter(p => p.roast === this.filter);
  }

  roastClass(roast: string): string {
    return roast?.toLowerCase() || 'medium';
  }

  set filter(value: string) {
    this._filter = value;
    this.applyFilter();
  }
  get filter(): string { return this._filter; }
  private _filter = 'All';
}
