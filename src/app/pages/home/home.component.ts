import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { WeatherStore } from '@core/stores/weather-store';
import { PreferencesService } from '@core/services/preferences.service';
import { ConfigService } from '@core/services/config.service';
import { SuggestionsService } from '@core/services/suggestions.service';
import { cardEnter, listStagger } from '@core/animations/animations';

import { SearchComponent } from '@features/search/search/search.component';
import { CurrentWeatherComponent } from '@features/weather/current-weather/current-weather.component';
import { ForecastComponent } from '@features/weather/forecast/forecast.component';
import { HourlyChartComponent } from '@features/weather/hourly-chart/hourly-chart.component';
import { AirQualityCardComponent } from '@features/weather/air-quality-card/air-quality-card.component';
import { SuggestionsComponent } from '@features/search/suggestions/suggestions.component';
import { WindCompassComponent } from '@features/weather/wind-compass/wind-compass.component';
import { SunArcComponent } from '@features/weather/sun-arc/sun-arc.component';
import { AlertsBannerComponent } from '@features/weather/alerts-banner/alerts-banner.component';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card.component';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslateModule,
    SearchComponent,
    CurrentWeatherComponent,
    ForecastComponent,
    HourlyChartComponent,
    AirQualityCardComponent,
    SuggestionsComponent,
    WindCompassComponent,
    SunArcComponent,
    AlertsBannerComponent,
    SkeletonCardComponent,
    SkeletonComponent,
  ],
  animations: [cardEnter, listStagger],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(WeatherStore);
  protected readonly prefs = inject(PreferencesService);
  protected readonly config = inject(ConfigService);
  private readonly suggestions = inject(SuggestionsService);

  readonly activitySuggestions = computed(() => {
    if (!this.config.feature('activityAI')) return [];
    const bundle = this.store.bundle();
    if (!bundle) return [];
    return this.suggestions.recommend({
      current: bundle.current,
      today: bundle.daily[0],
      hourly: bundle.hourly,
      airQuality: bundle.airQuality,
      units: this.prefs.units(),
    });
  });

  ngOnInit(): void {
    if (!this.store.hasData() && !this.store.selected()) {
      this.store.locateMe();
    } else if (this.store.selected()) {
      this.store.refresh();
    }
  }

  toggleUnits(): void {
    this.prefs.toggleUnits();
  }

  refresh(): void {
    this.store.refresh();
  }
}
