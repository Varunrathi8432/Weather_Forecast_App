import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { DailyForecastEntry } from '@app/core/models/weather.model';
import { PreferencesService } from '@app/core/preferences.service';
import { describeWeatherCode } from '@app/core/weather-codes';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [DatePipe, DecimalPipe, TranslateModule],
  templateUrl: './forecast.component.html',
  styleUrl: './forecast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForecastComponent {
  private readonly prefs = inject(PreferencesService);
  readonly daily = input.required<DailyForecastEntry[]>();
  readonly tempUnit = computed(() => (this.prefs.units() === 'imperial' ? '°F' : '°C'));

  info(code: number) {
    return describeWeatherCode(code);
  }
}
