// product-detail.component.ts — Track B (Angular)
// Lab 5: Product Detail Page — Spartacus-inspired

import { Component, OnInit }  from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService }     from '../../services/product.service';
import { Product }            from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav">
      <a routerLink="/" class="back-btn">← Back</a>
      <span class="nav-brand">☕ Kape Ko</span>
      <span class="sku-badge">{{ product?.id }}</span>
    </nav>

    <div *ngIf="loading" class="loading">
      <span>☕</span>
      <p>GET /api/products/{{ id }}</p>
    </div>

    <div *ngIf="!loading && product" class="container">
      <span class="roast-badge" [ngClass]="product.roast.toLowerCase()">
        {{ product.roast }} Roast
      </span>

      <h1 class="product-name">{{ product.name }}</h1>

      <p *ngIf="product.marketing_hook" class="hook">
        "{{ product.marketing_hook }}"
      </p>

      <!-- Origin details -->
      <div class="origin-grid">
        <div *ngFor="let field of originFields" class="origin-item">
          <div class="origin-label">{{ field.label }}</div>
          <div class="origin-val">{{ field.value }}</div>
        </div>
      </div>

      <!-- Flavor -->
      <div class="flavor-chips">
        <span *ngFor="let f of product.flavor_notes" class="chip">{{ f }}</span>
      </div>

      <!-- Description -->
      <div *ngIf="product.product_description" class="description">
        {{ product.product_description }}
      </div>

      <!-- Feature bullets -->
      <ul *ngIf="product.feature_bullets" class="bullets">
        <li *ngFor="let b of product.feature_bullets">{{ b }}</li>
      </ul>

      <!-- Pricing + CTA -->
      <div class="pricing-box">
        <div class="prices">
          <div class="price-item">
            <div class="price-label">One-time</div>
            <div class="price-val">₱{{ product.price_php }}</div>
          </div>
          <div class="price-item">
            <div class="price-label">Monthly subscription</div>
            <div class="price-val sub">₱{{ product.sub_price_php }}</div>
            <div class="price-save">Save ₱{{ product.price_php - product.sub_price_php }}/mo</div>
          </div>
        </div>
        <button class="cta-btn">
          Subscribe — ₱{{ product.sub_price_php }}/mo via GCash
        </button>
      </div>

      <p *ngIf="product.pairing_suggestion" class="pairing">
        ☕ {{ product.pairing_suggestion }}
      </p>
    </div>
  `,
  styles: [`
    .nav { background:#1C1917; padding:0 24px; height:52px; display:flex; align-items:center; justify-content:space-between; }
    .back-btn { color:#F59E0B; font-size:13px; font-weight:600; text-decoration:none; }
    .nav-brand { color:#fff; font-weight:700; }
    .sku-badge { color:#78716C; font-size:11px; }
    .loading { text-align:center; padding:48px; color:#A8A29E; }
    .container { max-width:640px; margin:0 auto; padding:32px 24px; }
    .roast-badge { font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; }
    .roast-badge.light { background:#FEF9C3; color:#92400E; }
    .roast-badge.medium { background:#FED7AA; color:#9A3412; }
    .roast-badge.dark { background:#E7E5E4; color:#292524; }
    .product-name { font-size:30px; font-weight:300; color:#1C1917; margin:12px 0 8px; }
    .hook { font-size:17px; font-style:italic; color:#B45309; margin-bottom:24px; }
    .origin-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#fff; border:0.5px solid #E7E5E4; border-radius:12px; padding:16px; margin-bottom:20px; }
    .origin-label { font-size:10px; color:#A8A29E; margin-bottom:2px; text-transform:uppercase; letter-spacing:.5px; }
    .origin-val { font-size:13px; font-weight:500; color:#1C1917; }
    .flavor-chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
    .chip { background:#FEF3C7; color:#92400E; font-size:12px; padding:4px 12px; border-radius:20px; }
    .description { font-size:13px; color:#57534E; line-height:1.8; margin-bottom:20px; white-space:pre-line; }
    .bullets { margin-bottom:24px; padding-left:0; list-style:none; }
    .bullets li { font-size:13px; color:#57534E; padding:4px 0; display:flex; gap:8px; }
    .bullets li::before { content:"▸"; color:#F59E0B; }
    .pricing-box { background:#fff; border:0.5px solid #E7E5E4; border-radius:12px; padding:20px; margin-bottom:20px; }
    .prices { display:flex; gap:32px; margin-bottom:20px; }
    .price-label { font-size:11px; color:#A8A29E; margin-bottom:4px; }
    .price-val { font-size:24px; font-weight:700; color:#1C1917; }
    .price-val.sub { color:#D97706; }
    .price-save { font-size:11px; color:#16A34A; margin-top:2px; }
    .cta-btn { width:100%; padding:14px; background:#D97706; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; }
    .cta-btn:hover { background:#B45309; }
    .pairing { text-align:center; color:#A8A29E; font-size:13px; font-style:italic; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  id = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.productService.getProduct(this.id).subscribe({
      next:  (p) => { this.product = p; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  get originFields() {
    if (!this.product) return [];
    return [
      { label: 'Origin',   value: this.product.origin },
      { label: 'Farmer',   value: this.product.farmer },
      { label: 'Altitude', value: this.product.altitude },
      { label: 'Variety',  value: this.product.variety },
      { label: 'Process',  value: this.product.process },
    ];
  }
}
