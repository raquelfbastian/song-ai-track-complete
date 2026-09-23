import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LabNavComponent } from '../../components/lab-nav/lab-nav.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-lab4',
  standalone: true,
  imports: [LabNavComponent, CommonModule, RouterModule],
  template: `
    <app-lab-nav />
    <div style="max-width:720px;margin:0 auto;padding:32px 24px">
      <p style="color:#F59E0B;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Lab 4</p>
      <h1 style="color:#1C1917;font-size:24px;font-weight:300;margin-bottom:8px">Product Content Studio</h1>
      <p style="color:#78716C;font-size:13px;margin-bottom:24px">Click each product to enrich with AI-generated SEO title, description, and marketing hook</p>

      <p *ngIf="loading" style="color:#78716C;font-size:13px">Loading catalog from Spring Boot...</p>

      <div *ngIf="!loading" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
        <button *ngFor="let p of products" (click)="enrich(p)"
          [style.background]="enriched[p.id] ? '#052E16' : enriching === p.id ? '#1C1004' : '#0F172A'"
          [style.border-color]="enriched[p.id] ? '#16A34A' : enriching === p.id ? '#F59E0B' : '#1E293B'"
          style="border:0.5px solid;border-radius:10px;padding:14px;text-align:left;cursor:pointer;transition:all .15s">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:10px;color:#475569">{{p.id}}</span>
            <span *ngIf="enriched[p.id]" style="font-size:10px;color:#34D399">✓ enriched</span>
            <span *ngIf="enriching === p.id" style="font-size:10px;color:#F59E0B">generating...</span>
          </div>
          <div style="font-size:13px;font-weight:500;color:#fff;margin-bottom:4px">{{p.name}}</div>
          <div style="font-size:11px;color:#475569">{{p.roast}}</div>
        </button>
      </div>

      <div *ngIf="selected"
        style="background:#fff;border:0.5px solid #E7E5E4;border-radius:10px;padding:16px;margin-bottom:20px">
        <div style="margin-bottom:12px">
          <div style="font-size:10px;color:#A8A29E;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">SEO Title</div>
          <div style="font-size:13px;color:#1C1917">{{selected.seo_title}}</div>
        </div>
        <div style="margin-bottom:12px">
          <div style="font-size:10px;color:#A8A29E;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Marketing Hook</div>
          <em style="font-size:16px;color:#D97706">"{{selected.marketing_hook}}"</em>
        </div>
        <div>
          <div style="font-size:10px;color:#A8A29E;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Description</div>
          <div style="font-size:12px;color:#57534E;line-height:1.6">{{selected.product_description}}</div>
        </div>
      </div>

      <a *ngIf="allDone" routerLink="/"
        style="display:block;text-align:center;background:#F59E0B;color:#fff;padding:12px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
        Lab 5: View Storefront →
      </a>
      <p *ngIf="!allDone && products.length > 0" style="text-align:center;color:#78716C;font-size:13px">
        Click each product to enrich ({{enrichedCount}}/{{products.length}} done)
      </p>
    </div>
  `
})
export class Lab4Component implements OnInit {
  products: Product[] = [];
  enriched: Record<string, Product> = {};
  enriching: string | null = null;
  selected: Product | null = null;
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getCatalog().subscribe({
      next: (r) => { this.products = r.products || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get allDone() { return this.products.length > 0 && this.enrichedCount === this.products.length; }
  get enrichedCount() { return Object.keys(this.enriched).length; }

  enrich(p: Product) {
    if (this.enriching) return;
    this.enriching = p.id;
    this.productService.enrichProduct(p.id).subscribe({
      next: (r) => { this.enriched[p.id] = r; this.selected = r; this.enriching = null; },
      error: () => { this.enriching = null; },
    });
  }
}
