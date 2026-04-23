import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { OnlineStatusService } from '@app/core/online-status.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (!online.online()) {
      <div class="banner" role="status" aria-live="polite">
        <span aria-hidden="true">🛰️</span>
        <span>{{ 'state.offline' | translate }}</span>
      </div>
    }
  `,
  styles: [
    `
      .banner {
        position: fixed;
        left: 50%;
        bottom: 1rem;
        transform: translateX(-50%);
        background: var(--surface);
        border: 1px solid var(--border);
        border-left: 4px solid var(--accent);
        padding: 0.5rem 0.9rem;
        border-radius: 999px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        display: inline-flex;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.9rem;
        z-index: 50;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineBannerComponent {
  protected readonly online = inject(OnlineStatusService);
}
