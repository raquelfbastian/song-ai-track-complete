// app.component.ts — Track B (Angular)
import { Component }    from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatWidgetComponent],
  template: `
    <router-outlet />
    <app-chat-widget />
  `,
})
export class AppComponent {}
