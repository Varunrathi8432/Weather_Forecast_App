import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AirQualityReading } from '@app/core/models/weather.model';

interface AqiBand {
  label: string;
  className: 'good' | 'fair' | 'moderate' | 'poor' | 'very-poor' | 'hazardous';
  from: number;
}

const EUR_BANDS: AqiBand[] = [
  { from: 0, label: 'Good', className: 'good' },
  { from: 20, label: 'Fair', className: 'fair' },
  { from: 40, label: 'Moderate', className: 'moderate' },
  { from: 60, label: 'Poor', className: 'poor' },
  { from: 80, label: 'Very poor', className: 'very-poor' },
  { from: 100, label: 'Hazardous', className: 'hazardous' },
];

@Component({
  selector: 'app-air-quality-card',
  standalone: true,
  imports: [DecimalPipe, TranslateModule],
  template: `
    <section class="card" [attr.aria-label]="'air.heading' | translate">
      <header>
        <h2>{{ 'air.heading' | translate }}</h2>
        <span class="band" [class]="band().className">{{ band().label }}</span>
      </header>
      <div class="main">
        <div class="aqi">
          <span class="value">{{ reading().europeanAqi | number: '1.0-0' }}</span>
          <span class="suffix">EU AQI</span>
        </div>
        <div class="meter" role="meter" [attr.aria-valuenow]="reading().europeanAqi" aria-valuemin="0" aria-valuemax="120">
          <div class="fill" [class]="band().className" [style.width.%]="fillPct()"></div>
        </div>
      </div>
      <dl>
        <div>
          <dt>PM2.5</dt>
          <dd>{{ reading().pm25 | number: '1.0-1' }} µg/m³</dd>
        </div>
        <div>
          <dt>PM10</dt>
          <dd>{{ reading().pm10 | number: '1.0-1' }} µg/m³</dd>
        </div>
        <div>
          <dt>O₃</dt>
          <dd>{{ reading().ozone | number: '1.0-0' }} µg/m³</dd>
        </div>
        <div>
          <dt>NO₂</dt>
          <dd>{{ reading().no2 | number: '1.0-0' }} µg/m³</dd>
        </div>
        <div>
          <dt>UV</dt>
          <dd>{{ reading().uvIndex | number: '1.0-1' }}</dd>
        </div>
      </dl>
    </section>
  `,
  styles: [
    `
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem 1.25rem;
      }
      header { display: flex; justify-content: space-between; align-items: center; }
      h2 { margin: 0; font-size: 1.05rem; }
      .band {
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary-contrast);
      }
      .band.good { background: #43a047; }
      .band.fair { background: #fbc02d; color: #1a1a1a; }
      .band.moderate { background: #fb8c00; }
      .band.poor { background: #e53935; }
      .band.very-poor { background: #8e24aa; }
      .band.hazardous { background: #4a148c; }
      .main { margin-top: 0.75rem; display: grid; gap: 0.5rem; }
      .aqi { display: inline-flex; gap: 0.4rem; align-items: baseline; }
      .value { font-size: 2rem; font-weight: 700; }
      .suffix { color: var(--text-muted); font-size: 0.9rem; }
      .meter {
        height: 10px;
        border-radius: 999px;
        background: var(--surface-alt);
        overflow: hidden;
        border: 1px solid var(--border);
      }
      .fill { height: 100%; transition: width 300ms ease; }
      .fill.good { background: #43a047; }
      .fill.fair { background: #fbc02d; }
      .fill.moderate { background: #fb8c00; }
      .fill.poor { background: #e53935; }
      .fill.very-poor { background: #8e24aa; }
      .fill.hazardous { background: #4a148c; }
      dl {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: 0.5rem;
        margin: 0.75rem 0 0;
      }
      dl > div {
        background: var(--surface-alt);
        border-radius: 10px;
        padding: 0.5rem 0.75rem;
      }
      dt { margin: 0 0 0.1rem; color: var(--text-muted); font-size: 0.8rem; }
      dd { margin: 0; font-weight: 600; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AirQualityCardComponent {
  readonly reading = input.required<AirQualityReading>();

  readonly band = computed(() => {
    const v = this.reading().europeanAqi;
    return [...EUR_BANDS].reverse().find((b) => v >= b.from) ?? EUR_BANDS[0];
  });

  readonly fillPct = computed(() => Math.max(5, Math.min(100, this.reading().europeanAqi)));
}
