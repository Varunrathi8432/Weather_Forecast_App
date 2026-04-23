import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { WeatherStore } from '@app/core/weather-store';
import { PreferencesService } from '@app/core/preferences.service';
import { ConfigService } from '@app/core/config.service';
import { SuggestionsService } from '@app/core/suggestions.service';
import { AnnouncerService } from '@app/core/announcer.service';
import { cardEnter, listStagger } from '@app/core/animations';

import { SearchComponent } from '@app/components/search/search.component';
import { CurrentWeatherComponent } from '@app/components/current-weather/current-weather.component';
import { ForecastComponent } from '@app/components/forecast/forecast.component';
import { HourlyChartComponent } from '@app/components/hourly-chart/hourly-chart.component';
import { AirQualityCardComponent } from '@app/components/air-quality-card/air-quality-card.component';
import { SuggestionsComponent } from '@app/components/suggestions/suggestions.component';
import { WindCompassComponent } from '@app/components/wind-compass/wind-compass.component';
import { SunArcComponent } from '@app/components/sun-arc/sun-arc.component';
import { AlertsBannerComponent } from '@app/components/alerts-banner/alerts-banner.component';
import { SkeletonCardComponent } from '@app/components/skeleton-card/skeleton-card.component';
import { SkeletonComponent } from '@app/components/skeleton/skeleton.component';

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
  private readonly announcer = inject(AnnouncerService);
  private readonly translate = inject(TranslateService);

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

  constructor() {
    effect(() => {
      const bundle = this.store.bundle();
      if (!bundle) return;
      const msg = this.translate.instant('a11y.updated', {
        city: bundle.location.name,
        temp: Math.round(bundle.current.temperature),
      });
      this.announcer.announce(msg);
    });
  }

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
