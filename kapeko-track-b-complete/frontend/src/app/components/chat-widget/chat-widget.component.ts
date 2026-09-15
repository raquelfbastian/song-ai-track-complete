// chat-widget.component.ts — Track B (Angular)
// Lab 6: Shopping Copilot — COMPLETE IMPLEMENTATION

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message { role: 'user' | 'assistant'; content: string; }

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Toggle button -->
    <button class="chat-toggle" (click)="open = !open" aria-label="Open Shopping Copilot">
      {{ open ? '✕' : '☕' }}
    </button>

    <!-- Chat panel -->
    <div class="chat-panel" *ngIf="open">
      <div class="chat-header">
        <div>
          <div class="chat-title">☕ Shopping Copilot</div>
          <div class="chat-sub">Powered by Kape Ko AI</div>
        </div>
        <button class="reset-btn" (click)="reset()">Reset</button>
      </div>

      <div class="chat-messages" #messagesContainer>
        <div *ngFor="let m of messages" class="message-row" [class.user-row]="m.role === 'user'">
          <div class="message-bubble" [class.user-bubble]="m.role === 'user'" [class.assistant-bubble]="m.role === 'assistant'">
            {{ m.content }}
          </div>
        </div>
        <div *ngIf="loading" class="message-row">
          <div class="message-bubble assistant-bubble">•••</div>
        </div>
      </div>

      <div class="chat-input-row">
        <input [(ngModel)]="inputText" (keydown.enter)="send()"
          placeholder="How are you feeling?" class="chat-input" />
        <button (click)="send()" [disabled]="loading || !inputText.trim()" class="send-btn">Send</button>
      </div>
    </div>
  `,
  styles: [`
    .chat-toggle { position:fixed; bottom:24px; right:24px; width:56px; height:56px;
      border-radius:50%; background:#1C1917; border:2px solid #F59E0B;
      cursor:pointer; font-size:24px; box-shadow:0 4px 20px rgba(0,0,0,.3);
      z-index:1000; display:flex; align-items:center; justify-content:center; color:#fff; }
    .chat-panel { position:fixed; bottom:92px; right:24px; width:340px; height:480px;
      background:#fff; border-radius:16px; border:.5px solid #E7E5E4;
      box-shadow:0 8px 40px rgba(0,0,0,.15); display:flex; flex-direction:column; z-index:999; }
    .chat-header { background:#1C1917; border-radius:16px 16px 0 0; padding:12px 16px;
      display:flex; align-items:center; justify-content:space-between; }
    .chat-title { color:#fff; font-size:14px; font-weight:600; }
    .chat-sub { color:#78716C; font-size:11px; }
    .reset-btn { background:none; border:none; color:#78716C; cursor:pointer; font-size:11px; }
    .chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
    .message-row { display:flex; justify-content:flex-start; }
    .user-row { justify-content:flex-end; }
    .message-bubble { max-width:80%; padding:8px 12px; border-radius:12px; font-size:13px; line-height:1.5; }
    .user-bubble { background:#F59E0B; color:#fff; border-bottom-right-radius:4px; }
    .assistant-bubble { background:#F5F5F4; color:#1C1917; border-bottom-left-radius:4px; }
    .chat-input-row { padding:10px 12px; border-top:.5px solid #E7E5E4; display:flex; gap:8px; }
    .chat-input { flex:1; padding:8px 12px; border-radius:8px; border:.5px solid #E7E5E4; font-size:13px; outline:none; }
    .send-btn { padding:8px 14px; background:#F59E0B; color:#fff; border:none; border-radius:8px;
      cursor:pointer; font-weight:600; font-size:13px; }
    .send-btn:disabled { opacity:.5; cursor:not-allowed; }
  `]
})
export class ChatWidgetComponent implements OnDestroy {
  open = false;
  messages: Message[] = [
    { role: 'assistant', content: "Kamusta! ☕ How are you feeling today? I'll help you find the right Kape Ko coffee." }
  ];
  inputText = '';
  loading = false;
  sessionId = `kape-ko-${Date.now()}`;

  constructor(private http: HttpClient) {}

  send() {
    if (!this.inputText.trim() || this.loading) return;
    const msg = this.inputText.trim();
    this.inputText = '';
    this.messages.push({ role: 'user', content: msg });
    this.loading = true;

    this.http.post<{ response: string }>('/api/chat', { sessionId: this.sessionId, message: msg })
      .subscribe({
        next: (res) => {
          this.messages.push({ role: 'assistant', content: res.response });
          this.loading = false;
        },
        error: () => {
          this.messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
          this.loading = false;
        }
      });
  }

  reset() {
    this.http.delete(`/api/chat/${this.sessionId}`).subscribe();
    this.messages = [{ role: 'assistant', content: "Kamusta! ☕ How are you feeling today? I'll help you find the right Kape Ko coffee." }];
  }

  ngOnDestroy() {
    this.http.delete(`/api/chat/${this.sessionId}`).subscribe();
  }
}
