// lab7.component.ts — Track B (Angular)
// Lab 7: Commerce RAG search page

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

@Component({
  selector: 'app-lab7',
  standalone: true,
  imports: [RouterModule, SearchBarComponent],
  template: `
    <nav class="nav">
      <a routerLink="/" class="brand">☕ Kape Ko</a>
      <div class="links">
        <a routerLink="/lab3">Lab 3</a>
        <a routerLink="/lab4">Lab 4</a>
        <a routerLink="/lab5">Lab 5</a>
        <a routerLink="/lab6">Lab 6</a>
        <a routerLink="/lab7" class="active">Lab 7</a>
      </div>
    </nav>
    <main class="page">
      <p class="eyebrow">Semantic product discovery</p>
      <h1>Lab 7 - Commerce RAG</h1>
      <p class="intro">Search by flavor, mood, or moment. Results are retrieved from the catalog and explained by the AI.</p>
      <app-search-bar />
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
    .page { max-width:860px; margin:0 auto; padding:64px 24px; }
    .eyebrow { color:#D97706; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
    h1 { margin:8px 0; font-size:38px; font-weight:700; }
    .intro { max-width:620px; color:#78716C; line-height:1.6; margin-bottom:28px; }
  `]
})
export class Lab7Component {}
