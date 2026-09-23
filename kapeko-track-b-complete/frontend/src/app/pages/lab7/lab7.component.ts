// lab7.component.ts — Track B (Angular)
// Lab 7: Commerce RAG search page

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LabNavComponent } from '../../components/lab-nav/lab-nav.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

@Component({
  selector: 'app-lab7',
  standalone: true,
  imports: [LabNavComponent, RouterModule, SearchBarComponent],
  template: `
    <app-lab-nav />
    <main class="page">
      <p class="eyebrow">Semantic product discovery</p>
      <h1>Lab 7 - Commerce RAG</h1>
      <p class="intro">Search by flavor, mood, or moment. Results are retrieved from the catalog and explained by the AI.</p>
      <app-search-bar />
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100vh; background:#FAFAF9; color:#1C1917; }
    .page { max-width:860px; margin:0 auto; padding:64px 24px; }
    .eyebrow { color:#D97706; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
    h1 { margin:8px 0; font-size:38px; font-weight:700; }
    .intro { max-width:620px; color:#78716C; line-height:1.6; margin-bottom:28px; }
  `]
})
export class Lab7Component {}
