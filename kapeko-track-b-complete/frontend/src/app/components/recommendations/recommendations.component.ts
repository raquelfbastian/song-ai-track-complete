// recommendations.component.ts — Track B (Angular)
// Lab 8: Recommendation Engine — COMPLETE IMPLEMENTATION

import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="products.length" class="recs-wrap">
      <div class="recs-label">You might also like</div>
      <div *ngFor="let p of products" class="rec-card" [routerLink]="['/products', p.id]">
        <div class="rec-icon" [style.background]="p.roast === 'Light' ? '#FEF9F2' : p.roast === 'Dark' ? '#292524' : '#FEF3C7'">☕</div>
        <div class="rec-info">
          <div class="rec-name">{{ p.name }}</div>
          <div class="rec-sub">{{ p.roast }} · {{ (p.flavor_notes || []).slice(0,2).join(', ') }}</div>
        </div>
        <div class="rec-price">₱{{ p.sub_price_php }}/mo</div>
      </div>
      <div class="recs-footnote">Powered by vector similarity search</div>
    </div>
  `,
  styles: [`
    .recs-wrap { margin-top:32px; }
    .recs-label { font-size:11px; font-weight:600; color:#A8A29E; text-transform:uppercase; letter-spacing:.7px; margin-bottom:12px; }
    .rec-card { background:#fff; border:.5px solid #E7E5E4; border-radius:10px; padding:14px;
      display:flex; align-items:center; gap:12px; margin-bottom:10px; cursor:pointer; text-decoration:none; }
    .rec-card:hover { border-color:#FCD34D; }
    .rec-icon { width:48px; height:48px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
    .rec-info { flex:1; }
    .rec-name { font-size:13px; font-weight:600; color:#1C1917; margin-bottom:2px; }
    .rec-sub { font-size:11px; color:#A8A29E; }
    .rec-price { font-size:14px; font-weight:700; color:#F59E0B; flex-shrink:0; }
    .recs-footnote { text-align:center; font-size:11px; color:#D1C5BC; font-style:italic; margin-top:10px; }
  `]
})
export class RecommendationsComponent implements OnChanges {
  @Input() productId = '';
  products: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnChanges() {
    if (!this.productId) return;
    this.http.get<{ recommendations: any[] }>(`/api/products/${this.productId}/recommendations?topN=3`)
      .subscribe({ next: r => this.products = r.recommendations || [], error: () => this.products = [] });
  }
}
