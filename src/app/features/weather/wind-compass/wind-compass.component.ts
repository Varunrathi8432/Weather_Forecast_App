import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-wind-compass',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <figure class="compass" [attr.aria-label]="ariaLabel()">
      <svg viewBox="0 0 120 120" role="img" focusable="false">
        <circle cx="60" cy="60" r="55" class="ring" />
        <g class="ticks">
          @for (tick of ticks; track tick) {
            <line
              [attr.x1]="60 + Math.cos((tick - 90) * Math.PI / 180) * 48"
              [attr.y1]="60 + Math.sin((tick - 90) * Math.PI / 180) * 48"
              [attr.x2]="60 + Math.cos((tick - 90) * Math.PI / 180) * 54"
              [attr.y2]="60 + Math.sin((tick - 90) * Math.PI / 180) * 54"
            />
          }
        </g>
        <text x="60" y="18" text-anchor="middle" class="cardinal">N</text>
        <text x="108" y="64" text-anchor="middle" class="cardinal">E</text>
        <text x="60" y="110" text-anchor="middle" class="cardinal">S</text>
        <text x="14" y="64" text-anchor="middle" class="cardinal">W</text>
        <g [style.transform]="rotation()" style="transform-origin: 60px 60px; transition: transform 400ms ease;">
          <polygon points="60,16 70,60 60,50 50,60" class="arrow" />
        </g>
        <circle cx="60" cy="60" r="4" class="hub" />
      </svg>
      <figcaption>
        <span class="bearing">{{ direction() }}°</span>
        <span class="cardinal-label">{{ cardinal() }}</span>
      </figcaption>
    </figure>
  `,
  styles: [
    `
      :host { display: block; min-width: 0; }
      .compass {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem;
      }
      svg {
        width: min(140px, 40vw);
        height: auto;
        max-width: 100%;
        aspect-ratio: 1 / 1;
      }
      .ring {
        fill: var(--surface-alt);
        stroke: var(--border);
        stroke-width: 1;
      }
      .ticks line { stroke: var(--text-muted); stroke-width: 1; }
      .cardinal {
        fill: var(--text-muted);
        font-size: 10px;
        font-weight: 600;
      }
      .arrow { fill: var(--primary); }
      .hub { fill: var(--text); }
      figcaption {
        text-align: center;
        display: grid;
        line-height: 1.1;
      }
      .bearing { font-weight: 700; color: var(--text); }
      .cardinal-label { color: var(--text-muted); font-size: 0.85rem; }
      @media (max-width: 480px) {
        .compass { padding: 0.85rem; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindCompassComponent {
  private readonly translate = inject(TranslateService);
  private readonly langTick = toSignal(this.translate.onLangChange);

  readonly direction = input.required<number>();
  readonly speed = input<number>(0);
  readonly unitLabel = input<string>('km/h');

  readonly ticks = Array.from({ length: 12 }, (_, i) => i * 30);
  readonly Math = Math;

  readonly rotation = computed(() => `rotate(${this.direction()}deg)`);
  readonly cardinal = computed(() => toCardinal(this.direction()));
  readonly ariaLabel = computed(() => {
    this.langTick();
    return this.translate.instant('wind.aria', {
      cardinal: this.cardinal(),
      degrees: Math.round(this.direction()),
      speed: this.speed(),
      unit: this.unitLabel(),
    });
  });
}

function toCardinal(bearing: number): string {
  const names = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(((bearing % 360) / 22.5)) % names.length;
  return names[idx];
}
