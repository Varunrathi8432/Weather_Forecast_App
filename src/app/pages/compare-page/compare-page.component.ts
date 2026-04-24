import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';

import { CompareStore } from '@core/stores/compare-store';
import { GeoService } from '@core/services/geo.service';
import { GeoLocation } from '@core/models/weather.model';
import { CompareCardComponent } from '@features/compare/compare-card/compare-card.component';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card.component';
import { listStagger } from '@core/animations/animations';

@Component({
  selector: 'app-compare-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CompareCardComponent, SkeletonCardComponent],
  animations: [listStagger],
  templateUrl: './compare-page.component.html',
  styleUrl: './compare-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparePageComponent implements OnDestroy {
  protected readonly store = inject(CompareStore);
  private readonly geo = inject(GeoService);
  private readonly destroy$ = new Subject<void>();

  readonly query = new FormControl<string>('', { nonNullable: true });
  readonly suggestions = signal<GeoLocation[]>([]);
  readonly orderedBundles = computed(() =>
    this.store.cities().map((c) => ({ city: c, bundle: this.store.bundles()[c.id] })),
  );

  constructor() {
    this.query.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => this.geo.search(q)),
        takeUntil(this.destroy$),
      )
      .subscribe((results) => this.suggestions.set(results));
  }

  add(loc: GeoLocation): void {
    this.store.add(loc);
    this.query.reset('');
    this.suggestions.set([]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
