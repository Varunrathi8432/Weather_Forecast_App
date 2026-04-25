import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ErrorService } from '@core/services/error.service';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="toast-stack" role="status" aria-live="polite">
      @for (t of errors.messages(); track t.id) {
        <div class="toast" [class]="t.kind">
          <span>{{ t.text }}</span>
          <button type="button" (click)="errors.dismiss(t.id)" [attr.aria-label]="'common.dismiss' | translate">✕</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        left: auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 100;
        max-width: min(calc(100vw - 2rem), 380px);
      }
      @media (max-width: 480px) {
        .toast-stack {
          left: 1rem;
          right: 1rem;
          bottom: 0.75rem;
          max-width: none;
        }
      }
      .toast {
        background: var(--surface);
        color: var(--text);
        border: 1px solid var(--border);
        border-left: 4px solid var(--danger);
        padding: 0.6rem 0.75rem;
        border-radius: 10px;
        display: flex;
        gap: 0.5rem;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        animation: slide-up 180ms ease-out;
      }
      .toast.info { border-left-color: var(--primary); }
      .toast.success { border-left-color: var(--accent); }
      .toast button {
        background: transparent;
        border: 0;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 0.9rem;
      }
      @keyframes slide-up {
        from { transform: translateY(12px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorToastComponent {
  protected readonly errors = inject(ErrorService);
}
