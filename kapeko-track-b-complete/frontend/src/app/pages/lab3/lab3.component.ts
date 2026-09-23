import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LabNavComponent } from '../../components/lab-nav/lab-nav.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-lab3',
  standalone: true,
  imports: [LabNavComponent, CommonModule, RouterModule],
  template: `
    <app-lab-nav />
    <div style="max-width:720px;margin:0 auto;padding:32px 24px">
      <p style="color:#F59E0B;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Lab 3</p>
      <h1 style="color:#1C1917;font-size:24px;font-weight:300;margin-bottom:8px">Product Catalog Builder</h1>
      <p style="color:#78716C;font-size:13px;margin-bottom:24px">Spring Boot CatalogService calls LLM API → generates structured JSON → exposes via GET /api/catalog</p>

      <button *ngIf="!loading && !done" (click)="generate()"
        style="width:100%;padding:14px;background:#F59E0B;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:16px">
        ▶  Run CatalogService.generateCatalog()
      </button>

      <div *ngIf="log.length > 0"
        style="background:#0F172A;border-radius:10px;padding:16px;margin-bottom:16px;font-family:monospace;font-size:12px">
        <p *ngFor="let l of log"
          [style.color]="l.startsWith('✓') ? '#34D399' : l.startsWith('✗') ? '#F87171' : '#94A3B8'"
          style="line-height:1.8">{{l}}</p>
      </div>

      <div *ngIf="done" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
        <div *ngFor="let p of products"
          style="background:#fff;border:0.5px solid #E7E5E4;border-radius:10px;padding:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:10px;color:#A8A29E">{{p.id}}</span>
            <span style="font-size:10px;background:#FEF9C3;color:#92400E;padding:2px 8px;border-radius:20px">{{p.roast}}</span>
          </div>
          <div style="font-size:14px;font-weight:600;color:#1C1917;margin-bottom:4px">{{p.name}}</div>
          <div style="font-size:11px;color:#A8A29E;margin-bottom:8px">{{p.origin}} · {{p.farmer}}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">
            <span *ngFor="let f of p.flavor_notes"
              style="font-size:10px;background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:20px">{{f}}</span>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <strong style="font-size:14px;color:#1C1917">₱{{p.price_php}}</strong>
            <span style="font-size:12px;color:#F59E0B">₱{{p.sub_price_php}}/mo</span>
          </div>
        </div>
      </div>

      <a *ngIf="done" routerLink="/lab4"
        style="display:block;text-align:center;background:#1C1917;color:#fff;padding:12px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
        Lab 4: Enrich content →
      </a>
    </div>
  `
})
export class Lab3Component {
  products: Product[] = [];
  log: string[] = [];
  loading = false;
  done = false;

  constructor(private productService: ProductService) {}

  generate() {
    this.loading = true;
    this.log = [
      '▶  POST /api/catalog/generate',
      '   Building catalog prompt...',
      '   Calling LLM API (~10-15s)...',
    ];
    this.productService.generateCatalog().subscribe({
      next: (r) => {
        this.log = [
          ...this.log,
          `✓  ${r.count} products generated`,
          '✓  Saved to data/catalog.json',
          '✓  GET /api/catalog ready',
        ];
        this.products = r.products || [];
        this.loading = false;
        this.done = true;
      },
      error: (e) => {
        this.log = [...this.log, `✗  Error: ${e.message}`];
        this.loading = false;
      },
    });
  }
}
