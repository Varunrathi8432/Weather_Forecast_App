import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { GeoService } from '@app/core/geo.service';
import { GeoLocation } from '@app/core/models/weather.model';
import { WeatherStore } from '@app/core/weather-store';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnDestroy {
  private readonly geo = inject(GeoService);
  private readonly store = inject(WeatherStore);
  private readonly destroy$ = new Subject<void>();

  readonly query = new FormControl<string>('', { nonNullable: true });
  readonly suggestions = signal<GeoLocation[]>([]);
  readonly activeIndex = signal(-1);
  readonly open = signal(false);

  constructor() {
    this.query.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => this.geo.search(q)),
        takeUntil(this.destroy$),
      )
      .subscribe((results) => {
        this.suggestions.set(results);
        this.open.set(results.length > 0);
        this.activeIndex.set(-1);
      });
  }

  select(location: GeoLocation): void {
    this.store.select(location);
    this.query.setValue(this.formatLocation(location), { emitEvent: false });
    this.open.set(false);
    this.suggestions.set([]);
  }

  locateMe(): void {
    this.store.locateMe();
  }

  formatLocation(location: GeoLocation): string {
    return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
  }

  onKeydown(event: KeyboardEvent): void {
    const list = this.suggestions();
    if (!list.length) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((i) => (i + 1) % list.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => (i <= 0 ? list.length - 1 : i - 1));
        break;
      case 'Enter': {
        const i = this.activeIndex();
        if (i >= 0) {
          event.preventDefault();
          this.select(list[i]);
        }
        break;
      }
      case 'Escape':
        this.open.set(false);
        break;
    }
  }

  onBlur(): void {
    // Slight delay so click on suggestion still registers.
    setTimeout(() => this.open.set(false), 150);
  }

  onFocus(): void {
    if (this.suggestions().length > 0) this.open.set(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
