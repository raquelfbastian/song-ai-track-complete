// lab10.component.ts — Track B (Angular)
// Lab 10: Multi-Agent Catalog Pipeline

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LabNavComponent } from '../../components/lab-nav/lab-nav.component';
import { HttpClient } from '@angular/common/http';

interface PipelineResult {
  status: string;
  productsProcessed: number;
  elapsedMs: number;
  agentsUsed: string[];
  results: Array<{
    productId: string;
    productName: string;
    catalogAgent: { status: string; notes: string };
    contentAgent: { product_description: string; marketing_hook: string; error?: string };
    seoAgent: { seo_title: string; meta_description: string; error?: string };
  }>;
}

@Component({
  selector: 'app-lab10',
  standalone: true,
  imports: [LabNavComponent, CommonModule, RouterModule],
  template: `
    <app-lab-nav />
    <main class="page">
      <p class="eyebrow">Orchestrated AI workflow</p>
      <h1>Lab 10 - Multi-Agent Catalog Pipeline</h1>
      <p class="intro">One orchestrator delegates catalog validation, marketing copy, and SEO to specialist agents for every product.</p>

      <section class="hero-box">
        <div class="agent-list">
          <span>Catalog Agent</span>
          <span>Content Agent</span>
          <span>SEO Agent</span>
        </div>
        <button class="run-btn" (click)="run()" [disabled]="loading">
          {{ loading ? 'Pipeline running...' : 'Run Catalog Pipeline' }}
        </button>
      </section>

      <p *ngIf="error" class="error">{{ error }}</p>
      <section *ngIf="result" class="summary">
        <strong>{{ result.status }}</strong>
        <span>{{ result.productsProcessed }} products processed</span>
        <span>{{ result.elapsedMs }} ms</span>
      </section>

      <section *ngFor="let item of result?.results" class="product-result">
        <div class="product-heading">
          <h2>{{ item.productName }}</h2>
          <span>{{ item.productId }}</span>
        </div>
        <div class="agent-grid">
          <article>
            <h3>Catalog Agent</h3>
            <p class="status">{{ item.catalogAgent.status }}</p>
            <p>{{ item.catalogAgent.notes }}</p>
          </article>
          <article>
            <h3>Content Agent</h3>
            <p>{{ item.contentAgent.marketing_hook || item.contentAgent.error || 'No content returned' }}</p>
          </article>
          <article>
            <h3>SEO Agent</h3>
            <p>{{ item.seoAgent.seo_title || item.seoAgent.error || 'No SEO title returned' }}</p>
            <small>{{ item.seoAgent.meta_description }}</small>
          </article>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100vh; background:#FAFAF9; color:#1C1917; }
    .page { max-width:980px; margin:0 auto; padding:56px 24px; }
    .eyebrow { color:#D97706; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
    h1 { margin:8px 0; font-size:38px; font-weight:700; }
    .intro { color:#78716C; line-height:1.6; max-width:700px; margin-bottom:28px; }
    .hero-box, .summary, .product-result { background:#fff; border:1px solid #E7E5E4; border-radius:12px; padding:20px; }
    .hero-box { display:flex; align-items:center; justify-content:space-between; gap:20px; }
    .agent-list { display:flex; gap:10px; flex-wrap:wrap; color:#92400E; font-size:12px; font-weight:600; }
    .agent-list span { background:#FEF3C7; border-radius:20px; padding:7px 11px; }
    .run-btn { padding:13px 18px; background:#D97706; color:#fff; border:0; border-radius:8px; font-weight:700; cursor:pointer; white-space:nowrap; }
    .run-btn:disabled { opacity:.5; cursor:not-allowed; }
    .error { margin:20px 0; color:#DC2626; }
    .summary { display:flex; gap:20px; margin-top:20px; color:#78716C; font-size:13px; }
    .summary strong { color:#16A34A; text-transform:uppercase; }
    .product-result { margin-top:16px; }
    .product-heading { display:flex; justify-content:space-between; align-items:baseline; border-bottom:1px solid #E7E5E4; padding-bottom:10px; }
    h2 { font-size:17px; margin:0; }
    .product-heading span { color:#A8A29E; font-size:11px; }
    .agent-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:14px; }
    article { background:#FAFAF9; border-radius:8px; padding:12px; min-width:0; }
    h3 { font-size:11px; color:#B45309; text-transform:uppercase; letter-spacing:.5px; margin:0 0 8px; }
    article p, article small { color:#57534E; font-size:12px; line-height:1.5; }
    .status { color:#16A34A; font-weight:700; text-transform:capitalize; }
    @media (max-width:700px) { .hero-box { align-items:stretch; flex-direction:column; } .agent-grid { grid-template-columns:1fr; } .summary { flex-wrap:wrap; } }
  `]
})
export class Lab10Component {
  loading = false;
  error = '';
  result: PipelineResult | null = null;

  constructor(private http: HttpClient) {}

  run() {
    this.loading = true;
    this.error = '';
    this.result = null;
    this.http.post<PipelineResult>('/api/agent/catalog/pipeline', {}).subscribe({
      next: result => { this.result = result; this.loading = false; },
      error: error => {
        this.error = error.error?.error || 'Catalog pipeline failed.';
        this.loading = false;
      }
    });
  }
}
