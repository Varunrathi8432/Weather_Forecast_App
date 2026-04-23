import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'error' | 'info' | 'success';
}

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly _messages = signal<ToastMessage[]>([]);
  readonly messages = this._messages.asReadonly();
  private counter = 0;

  push(text: string, kind: ToastMessage['kind'] = 'error', ttlMs = 4500): void {
    const id = ++this.counter;
    this._messages.update((m) => [...m, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), ttlMs);
  }

  dismiss(id: number): void {
    this._messages.update((m) => m.filter((t) => t.id !== id));
  }
}
