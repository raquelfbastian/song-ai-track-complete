// search-bar.component.ts — Track B (Angular)
// Lab 7: Commerce RAG — COMPLETE IMPLEMENTATION

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface SearchResult {
  query: string; answer: string; sources: string[]; products: any[];
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-wrap">
      <div class="search-row">
        <input [(ngModel)]="query" (keydown.enter)="search()"
          placeholder='Try: "light floral coffee" or "coffee for a stressed Monday"'
          class="search-input" />
        <button (click)="search()" [disabled]="loading || !query.trim()" class="search-btn">
          {{ loading ? '...' : 'Search' }}
        </button>
        <button *ngIf="result" (click)="clear()" class="clear-btn">Clear</button>
      </div>

      <div *ngIf="error" class="error-box">{{ error }}</div>

      <div *ngIf="result" class="result-box">
        <div class="ai-label">🤖 AI Answer (grounded in catalog)</div>
        <div class="ai-answer">{{ result.answer }}</div>
        <div class="sources-row">
          <span class="sources-label">Sources:</span>
          <span *ngFor="let s of result.sources" class="source-chip">{{ s }}</span>
        </div>
        <div *ngIf="result.products.length" class="products-list">
          <div class="products-label">Top matches by semantic similarity:</div>
          <div *ngFor="let p of result.products; let i = index" class="product-row">
            <span class="rank-badge" [class.rank-first]="i === 0">{{ i + 1 }}</span>
            <div>
              <div class="product-name">{{ p.name }}</div>
              <div class="product-sub">{{ p.roast }} · {{ p.best_for }}</div>
            </div>
            <div class="product-price">₱{{ p.sub_price_php }}/mo</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-wrap { max-width:760px; margin:0 auto; padding:0 24px 20px; }
    .search-row { display:flex; gap:8px; margin-bottom:12px; }
    .search-input { flex:1; padding:10px 16px; border-radius:10px; border:.5px solid #E7E5E4; font-size:13px; outline:none; }
    .search-btn { padding:10px 20px; background:#1C1917; color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:600; font-size:13px; }
    .search-btn:disabled { opacity:.5; cursor:not-allowed; }
    .clear-btn { padding:10px 16px; background:transparent; color:#A8A29E; border:.5px solid #E7E5E4; border-radius:10px; cursor:pointer; font-size:13px; }
    .error-box { background:#FFF5F5; border:.5px solid #FECACA; border-radius:10px; padding:12px 16px; color:#DC2626; font-size:13px; margin-bottom:12px; }
    .result-box { background:#fff; border:.5px solid #E7E5E4; border-radius:12px; padding:16px; margin-bottom:12px; }
    .ai-label { font-size:10px; color:#A8A29E; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
    .ai-answer { font-size:14px; color:#1C1917; line-height:1.6; margin-bottom:12px; }
    .sources-row { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
    .sources-label { font-size:11px; color:#A8A29E; }
    .source-chip { font-size:11px; background:#FEF3C7; color:#92400E; padding:2px 8px; border-radius:20px; }
    .products-list { margin-top:12px; border-top:.5px solid #E7E5E4; padding-top:12px; }
    .products-label { font-size:11px; color:#A8A29E; margin-bottom:8px; }
    .product-row { display:flex; align-items:center; gap:10px; background:#FAFAF9; border-radius:8px; padding:8px 12px; margin-bottom:6px; }
    .rank-badge { width:20px; height:20px; border-radius:50%; background:#E7E5E4; color:#A8A29E; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
    .rank-first { background:#F59E0B; color:#fff; }
    .product-name { font-size:13px; font-weight:500; color:#1C1917; }
    .product-sub { font-size:11px; color:#A8A29E; }
    .product-price { margin-left:auto; font-size:13px; font-weight:600; color:#F59E0B; flex-shrink:0; }
  `]
})
export class SearchBarComponent {
  query = '';
  result: SearchResult | null = null;
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  search() {
    if (!this.query.trim()) return;
    this.loading = true; this.error = ''; this.result = null;
    this.http.get<SearchResult>(`/api/search?q=${encodeURIComponent(this.query)}`)
      .subscribe({ next: r => { this.result = r; this.loading = false; },
        error: e => { this.error = e.message; this.loading = false; } });
  }

  clear() { this.query = ''; this.result = null; this.error = ''; }
}
