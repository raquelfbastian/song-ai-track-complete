// lab-nav.component.ts — Track B (Angular)
// Shared top navigation for all lab pages

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lab-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav">
      <a routerLink="/" class="brand">☕ Kape Ko</a>
      <div class="links">
        <a *ngFor="let n of labs" [routerLink]="'/lab' + n" routerLinkActive="active">Lab {{ n }}</a>
      </div>
    </nav>
  `,
  styles: [`
    :host { display:block; }
    .nav { min-height:56px; padding:0 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; background:#1C1917; }
    .brand, .links a { text-decoration:none; }
    .brand { color:#fff; font-size:18px; font-weight:700; }
    .links { display:flex; gap:18px; flex-wrap:wrap; justify-content:flex-end; }
    .links a { color:#A8A29E; font-size:13px; }
    .links a.active, .links a:hover { color:#F59E0B; }
  `],
})
export class LabNavComponent {
  labs = [3, 4, 5, 6, 7, 8, 9, 10];
}
