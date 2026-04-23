import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { InstallPromptService } from '@app/core/install-prompt.service';

@Component({
  selector: 'app-install-banner',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (install.canInstall()) {
      <div class="banner" role="region" aria-label="Install app">
        <span aria-hidden="true">📲</span>
        <span>{{ 'install.pitch' | translate }}</span>
        <button type="button" (click)="promptInstall()">{{ 'install.cta' | translate }}</button>
      </div>
    }
  `,
  styles: [
    `
      .banner {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        background: color-mix(in srgb, var(--primary) 10%, var(--surface));
        border: 1px solid color-mix(in srgb, var(--primary) 35%, var(--border));
        color: var(--text);
        padding: 0.6rem 0.9rem;
        border-radius: 12px;
        font-size: 0.95rem;
      }
      button {
        margin-left: auto;
        background: var(--primary);
        color: var(--primary-contrast);
        border: 0;
        border-radius: 8px;
        padding: 0.4rem 0.85rem;
        font-weight: 600;
        cursor: pointer;
      }
      button:hover, button:focus-visible { filter: brightness(1.05); }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallBannerComponent {
  protected readonly install = inject(InstallPromptService);

  promptInstall(): void {
    void this.install.prompt();
  }
}
