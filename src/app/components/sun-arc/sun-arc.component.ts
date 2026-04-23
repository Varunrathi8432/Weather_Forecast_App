import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sun-arc',
  standalone: true,
  imports: [DatePipe, TranslateModule],
  template: `
    <figure class="sun" [attr.aria-label]="ariaLabel()">
      <svg viewBox="0 0 200 110" role="img" focusable="false">
        <defs>
          <linearGradient id="sun-trail" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.45" />
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path [attr.d]="trailPath()" fill="url(#sun-trail)" stroke="none" />
        <path [attr.d]="arcPath()" fill="none" stroke="var(--primary)" stroke-width="2" />
        <line x1="10" y1="100" x2="190" y2="100" class="horizon" />
        <circle [attr.cx]="sunX()" [attr.cy]="sunY()" r="7" class="sun-dot" />
      </svg>
      <figcaption>
        <div>
          <span aria-hidden="true">🌅</span>
          <strong>{{ sunrise() | date: 'HH:mm' }}</strong>
          <span>{{ 'sun.sunrise' | translate }}</span>
        </div>
        <div>
          <span aria-hidden="true">🌇</span>
          <strong>{{ sunset() | date: 'HH:mm' }}</strong>
          <span>{{ 'sun.sunset' | translate }}</span>
        </div>
      </figcaption>
    </figure>
  `,
  styles: [
    `
      .sun {
        margin: 0;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem;
        display: grid;
        gap: 0.5rem;
      }
      svg { width: 100%; height: auto; display: block; }
      .horizon { stroke: var(--border); stroke-width: 1; stroke-dasharray: 4 4; }
      .sun-dot {
        fill: var(--primary);
        filter: drop-shadow(0 0 6px color-mix(in srgb, var(--primary) 60%, transparent));
      }
      figcaption {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-muted);
      }
      figcaption div { display: inline-flex; align-items: center; gap: 0.35rem; }
      strong { color: var(--text); }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SunArcComponent {
  readonly sunrise = input.required<string>();
  readonly sunset = input.required<string>();
  readonly now = input<string>(new Date().toISOString());

  readonly progress = computed(() => {
    const rise = new Date(this.sunrise()).getTime();
    const set = new Date(this.sunset()).getTime();
    const now = new Date(this.now()).getTime();
    if (set <= rise) return 0;
    return Math.max(0, Math.min(1, (now - rise) / (set - rise)));
  });

  readonly sunX = computed(() => 10 + this.progress() * 180);
  readonly sunY = computed(() => {
    const x = this.progress();
    return 100 - Math.sin(x * Math.PI) * 85;
  });

  readonly arcPath = computed(() => `M 10 100 Q 100 10 190 100`);
  readonly trailPath = computed(() => `M 10 100 Q 100 10 ${this.sunX()} ${this.sunY()} L ${this.sunX()} 100 Z`);

  readonly ariaLabel = computed(() => {
    const pct = Math.round(this.progress() * 100);
    return `Daylight progress ${pct}%. Sunrise ${this.sunrise()}, sunset ${this.sunset()}.`;
  });
}
