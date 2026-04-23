import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="loader" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>{{ label() }}</p>
    </div>
  `,
  styles: [
    `
      .loader {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        padding: 1rem 1.25rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
      }
      .spinner {
        width: 22px;
        height: 22px;
        border: 3px solid var(--border);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 900ms linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  readonly label = input<string>('Loading…');
}
