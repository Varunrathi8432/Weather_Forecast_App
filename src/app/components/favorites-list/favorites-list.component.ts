import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { GeoLocation } from '@app/core/models/weather.model';
import { PreferencesService } from '@app/core/preferences.service';
import { WeatherStore } from '@app/core/weather-store';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesListComponent {
  protected readonly prefs = inject(PreferencesService);
  private readonly store = inject(WeatherStore);

  select(loc: GeoLocation): void {
    this.store.select(loc);
  }

  remove(id: number, event: Event): void {
    event.stopPropagation();
    this.prefs.removeFavorite(id);
  }
}
