import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { WeatherBundle } from '@core/models/weather.model';
import { PreferencesService } from '@core/services/preferences.service';
import { describeWeatherCode } from '@core/constants/weather-codes';

@Component({
  selector: 'app-compare-card',
  standalone: true,
  imports: [DecimalPipe, TranslateModule],
  template: `
    <article class="card">
      <header>
        <div>
          <h3>{{ bundle().location.name }}</h3>
          <span>{{ bundle().location.country }}</span>
        </div>
        <button type="button" (click)="remove.emit(bundle().location.id)" [attr.aria-label]="'compare.remove' | translate">
          ✕
        </button>
      </header>
      <div class="main">
        <span class="icon" aria-hidden="true">{{ info().icon }}</span>
        <div>
          <div class="temp">{{ bundle().current.temperature | number: '1.0-0' }}{{ tempUnit() }}</div>
          <div class="label">{{ info().labelKey | translate }}</div>
        </div>
      </div>
      <dl>
        <div><dt>{{ 'current.wind' | translate }}</dt><dd>{{ bundle().current.windSpeed | number: '1.0-0' }} {{ windUnit() }}</dd></div>
        <div><dt>{{ 'current.humidity' | translate }}</dt><dd>{{ bundle().current.humidity | number: '1.0-0' }}%</dd></div>
        @if (bundle().airQuality) {
          <div><dt>EU AQI</dt><dd>{{ bundle().airQuality!.europeanAqi | number: '1.0-0' }}</dd></div>
        }
        <div><dt>{{ 'forecast.today' | translate }}</dt><dd>{{ bundle().daily[0].tempMax | number: '1.0-0' }}° / {{ bundle().daily[0].tempMin | number: '1.0-0' }}°</dd></div>
      </dl>
    </article>
  `,
  styles: [
    `
      :host { display: block; min-width: 0; }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem 1.1rem;
        display: grid;
        gap: 0.75rem;
        min-width: 0;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
      }
      header > div { min-width: 0; flex: 1; }
      header h3 { margin: 0; font-size: 1.05rem; word-break: break-word; }
      header span { color: var(--text-muted); font-size: 0.85rem; word-break: break-word; }
      header button {
        background: transparent; border: 0; color: var(--text-muted); cursor: pointer; font-size: 1rem;
        min-width: 2rem; min-height: 2rem; flex-shrink: 0;
      }
      header button:hover, header button:focus-visible { color: var(--danger); }
      .main { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
      .main > div { min-width: 0; }
      .icon { font-size: clamp(2rem, 7vw, 2.4rem); }
      .temp { font-size: clamp(1.5rem, 5vw, 1.8rem); font-weight: 700; line-height: 1; }
      .label { color: var(--text-muted); font-size: 0.9rem; }
      dl {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.5rem;
        margin: 0;
      }
      dl > div {
        background: var(--surface-alt);
        border-radius: 10px;
        padding: 0.5rem 0.7rem;
        min-width: 0;
      }
      dt { color: var(--text-muted); font-size: 0.78rem; margin: 0 0 0.15rem; }
      dd { margin: 0; font-weight: 600; word-break: break-word; }
      @media (max-width: 380px) {
        .card { padding: 0.85rem 0.95rem; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareCardComponent {
  private readonly prefs = inject(PreferencesService);

  readonly bundle = input.required<WeatherBundle>();
  readonly remove = output<number>();

  readonly info = computed(() => describeWeatherCode(this.bundle().current.weatherCode));
  readonly tempUnit = computed(() => (this.prefs.units() === 'imperial' ? '°F' : '°C'));
  readonly windUnit = computed(() => (this.prefs.units() === 'imperial' ? 'mph' : 'km/h'));
}
