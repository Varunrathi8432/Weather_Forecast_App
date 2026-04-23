import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CurrentWeather, GeoLocation } from '@app/core/models/weather.model';
import { PreferencesService } from '@app/core/preferences.service';
import { describeWeatherCode } from '@app/core/weather-codes';
import { ErrorService } from '@app/core/error.service';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [DatePipe, DecimalPipe, TranslateModule],
  templateUrl: './current-weather.component.html',
  styleUrl: './current-weather.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentWeatherComponent {
  private readonly prefs = inject(PreferencesService);
  private readonly translate = inject(TranslateService);
  private readonly errors = inject(ErrorService);

  readonly current = input.required<CurrentWeather>();
  readonly location = input.required<GeoLocation>();

  readonly info = computed(() => describeWeatherCode(this.current().weatherCode));
  readonly tempUnit = computed(() => (this.prefs.units() === 'imperial' ? '°F' : '°C'));
  readonly windUnit = computed(() => (this.prefs.units() === 'imperial' ? 'mph' : 'km/h'));
  readonly precipUnit = computed(() => (this.prefs.units() === 'imperial' ? 'in' : 'mm'));

  readonly isFavorite = computed(() => this.prefs.isFavorite(this.location().id));

  toggleFavorite(): void {
    this.prefs.toggleFavorite(this.location());
  }

  async share(): Promise<void> {
    const loc = this.location();
    const current = this.current();
    const text = `${loc.name}: ${Math.round(current.temperature)}${this.tempUnit()} · ${this.info().label}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Weather Forecast', text, url: location.href });
        return;
      } catch {
        // user cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      this.errors.push(this.translate.instant('current.copied'), 'success');
    } catch {
      this.errors.push(this.translate.instant('current.shareFailed'));
    }
  }
}
