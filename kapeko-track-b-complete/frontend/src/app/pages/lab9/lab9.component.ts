// lab9.component.ts — Track B (Angular)
// Lab 9: Order Assistant Agent

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface AgentResponse {
  type: string;
  response: string;
  tool?: string;
  toolCalled?: boolean;
  result?: unknown;
}

@Component({
  selector: 'app-lab9',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <nav class="nav">
      <a routerLink="/" class="brand">☕ Kape Ko</a>
      <div class="links">
        <a routerLink="/lab3">Lab 3</a>
        <a routerLink="/lab4">Lab 4</a>
        <a routerLink="/lab5">Lab 5</a>
        <a routerLink="/lab6">Lab 6</a>
        <a routerLink="/lab7">Lab 7</a>
        <a routerLink="/lab8">Lab 8</a>
        <a routerLink="/lab9" class="active">Lab 9</a>
      </div>
    </nav>
    <main class="page">
      <p class="eyebrow">Autonomous customer support</p>
      <h1>Lab 9 - Order Assistant Agent</h1>
      <p class="intro">Ask about an order or subscription. The agent decides which order-management tool to use.</p>

      <section class="agent-box">
        <label for="customer">Customer ID</label>
        <input id="customer" [(ngModel)]="customerId" class="input" />
        <label for="message">What do you need?</label>
        <textarea id="message" [(ngModel)]="message" rows="4" class="input"
          placeholder="Try: Where is order ORD-1001? or Pause my subscription for 2 months."></textarea>
        <button (click)="send()" [disabled]="loading || !message.trim()" class="send-btn">
          {{ loading ? 'Agent is working...' : 'Ask Order Assistant' }}
        </button>
      </section>

      <section *ngIf="error" class="error">{{ error }}</section>
      <section *ngIf="result" class="result">
        <div class="result-label">{{ result.toolCalled ? 'Tool result' : 'Assistant response' }}</div>
        <p>{{ result.response }}</p>
        <div *ngIf="result.tool" class="tool">Tool called: {{ result.tool }}</div>
      </section>
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
    .agent-box, .result { background:#fff; border:1px solid #E7E5E4; border-radius:12px; padding:20px; }
    label { display:block; color:#78716C; font-size:12px; margin:0 0 8px; }
    .input { width:100%; box-sizing:border-box; padding:12px; margin:0 0 16px; border:1px solid #D6D3D1; border-radius:8px; font:inherit; resize:vertical; }
    .send-btn { width:100%; padding:13px; background:#D97706; color:#fff; border:0; border-radius:8px; font-weight:700; cursor:pointer; }
    .send-btn:disabled { opacity:.5; cursor:not-allowed; }
    .result { margin-top:20px; border-left:4px solid #F59E0B; }
    .result-label { color:#A8A29E; font-size:11px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
    .result p { line-height:1.6; margin:0; }
    .tool { margin-top:14px; color:#B45309; font-size:12px; font-weight:600; }
    .error { margin-top:20px; color:#DC2626; }
  `]
})
export class Lab9Component {
  customerId = 'cust-demo';
  message = '';
  loading = false;
  error = '';
  result: AgentResponse | null = null;

  constructor(private http: HttpClient) {}

  send() {
    if (!this.message.trim() || this.loading) return;
    this.loading = true;
    this.error = '';
    this.result = null;
    this.http.post<AgentResponse>('/api/agent/order', {
      customerId: this.customerId,
      message: this.message.trim()
    }).subscribe({
      next: result => { this.result = result; this.loading = false; },
      error: error => {
        this.error = error.error?.error || 'Order Assistant request failed.';
        this.loading = false;
      }
    });
  }
}
