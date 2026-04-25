import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ShortcutsService } from '@core/services/shortcuts.service';

@Component({
  selector: 'app-shortcut-help',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (shortcuts.helpOpen()) {
      <div class="backdrop" (click)="close()" (keydown.escape)="close()"></div>
      <div class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="'shortcuts.title' | translate">
        <header>
          <h2>{{ 'shortcuts.title' | translate }}</h2>
          <button type="button" (click)="close()" [attr.aria-label]="'common.close' | translate">✕</button>
        </header>
        <dl>
          @for (s of shortcuts.list(); track s.key) {
            <div>
              <dt><kbd>{{ s.key }}</kbd></dt>
              <dd>{{ s.description | translate }}</dd>
            </div>
          }
          <div>
            <dt><kbd>?</kbd></dt>
            <dd>{{ 'shortcuts.toggle' | translate }}</dd>
          </div>
        </dl>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 80;
      }
      .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1.25rem 1.5rem;
        width: min(92vw, 420px);
        max-width: calc(100vw - 1rem);
        max-height: calc(100vh - 2rem);
        max-height: calc(100dvh - 2rem);
        overflow-y: auto;
        z-index: 81;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      }
      @media (max-width: 480px) {
        .dialog { padding: 1rem 1.1rem; }
      }
      header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
      header h2 { margin: 0; font-size: 1.1rem; }
      header button {
        background: transparent; border: 0; font-size: 1rem; color: var(--text-muted); cursor: pointer;
      }
      dl { margin: 0; display: grid; gap: 0.5rem; }
      dl > div { display: flex; gap: 0.75rem; align-items: baseline; }
      dt { margin: 0; }
      dd { margin: 0; color: var(--text-muted); }
      kbd {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-bottom-width: 2px;
        border-radius: 6px;
        padding: 0.15rem 0.45rem;
        font-size: 0.85rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortcutHelpComponent {
  protected readonly shortcuts = inject(ShortcutsService);

  close(): void {
    this.shortcuts.helpOpen.set(false);
  }
}
