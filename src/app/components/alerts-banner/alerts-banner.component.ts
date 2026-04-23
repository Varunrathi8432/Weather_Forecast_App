import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { cardEnter } from '@app/core/animations';
import { WeatherAlert } from '@app/core/models/weather.model';

@Component({
  selector: 'app-alerts-banner',
  standalone: true,
  imports: [TranslateModule],
  animations: [cardEnter],
  template: `
    @if (alerts().length > 0) {
      <section class="alerts" aria-live="polite" [attr.aria-label]="'alerts.heading' | translate">
        @for (alert of alerts(); track alert.id) {
          <article class="alert" [class]="alert.severity" @cardEnter>
            <div class="icon" aria-hidden="true">{{ iconFor(alert.severity) }}</div>
            <div class="body">
              <h3>{{ alert.title }}</h3>
              <p>{{ alert.description }}</p>
            </div>
          </article>
        }
      </section>
    }
  `,
  styles: [
    `
      .alerts { display: grid; gap: 0.5rem; }
      .alert {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--surface);
        border-left: 4px solid var(--primary);
      }
      .alert.advisory { border-left-color: #f9a825; background: color-mix(in srgb, #f9a825 10%, var(--surface)); }
      .alert.warning { border-left-color: var(--danger); background: color-mix(in srgb, var(--danger) 10%, var(--surface)); }
      .alert.info { border-left-color: var(--primary); }
      .alert.watch { border-left-color: #ef6c00; background: color-mix(in srgb, #ef6c00 10%, var(--surface)); }
      .icon { font-size: 1.4rem; line-height: 1; }
      h3 { margin: 0 0 0.15rem; font-size: 1rem; }
      p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsBannerComponent {
  readonly alerts = input.required<WeatherAlert[]>();

  iconFor(severity: WeatherAlert['severity']): string {
    switch (severity) {
      case 'warning':
        return '⚠️';
      case 'advisory':
        return '🟠';
      case 'watch':
        return '👀';
      default:
        return 'ℹ️';
    }
  }
}
