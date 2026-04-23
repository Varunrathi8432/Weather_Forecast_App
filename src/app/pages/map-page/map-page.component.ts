import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';

import { environment } from '@env/environment';

// Workaround: Leaflet's default marker icon URLs are resolved relative to the
// built CSS, which breaks when bundled. Point them at the CDN copy.
const iconBase = 'https://unpkg.com/leaflet@1.9.4/dist/images';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `${iconBase}/marker-icon-2x.png`,
  iconUrl: `${iconBase}/marker-icon.png`,
  shadowUrl: `${iconBase}/marker-shadow.png`,
});
import { WeatherStore } from '@app/core/weather-store';
import { PreferencesService } from '@app/core/preferences.service';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>{{ 'map.title' | translate }}</h1>
        <p>{{ 'map.subtitle' | translate }}</p>
      </header>
      <div #mapEl class="map" role="region" [attr.aria-label]="'map.aria' | translate"></div>
    </div>
  `,
  styles: [
    `
      .page { display: grid; gap: 1rem; }
      h1 { margin: 0; }
      .page-header p { margin: 0.25rem 0 0; color: var(--text-muted); }
      .map {
        width: 100%;
        height: 70vh;
        min-height: 420px;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid var(--border);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPageComponent implements AfterViewInit, OnDestroy {
  private readonly store = inject(WeatherStore);
  private readonly prefs = inject(PreferencesService);
  readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');

  private map?: L.Map;
  private markers: L.Marker[] = [];

  constructor() {
    effect(() => {
      const selected = this.store.selected();
      const favorites = this.prefs.favorites();
      if (this.map) this.render(selected, favorites);
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl().nativeElement, { zoomControl: true }).setView(
      [20, 0],
      2,
    );
    L.tileLayer(environment.mapTileUrl, {
      attribution: environment.mapAttribution,
      maxZoom: 18,
    }).addTo(this.map);
    this.render(this.store.selected(), this.prefs.favorites());
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private render(
    selected: ReturnType<WeatherStore['selected']>,
    favorites: ReturnType<PreferencesService['favorites']>,
  ): void {
    if (!this.map) return;
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    const points = [...favorites];
    if (selected && !favorites.some((f) => f.id === selected.id)) {
      points.push(selected);
    }

    points.forEach((p) => {
      const marker = L.marker([p.latitude, p.longitude]).bindPopup(
        `<strong>${p.name}</strong>${p.country ? `<br>${p.country}` : ''}`,
      );
      marker.addTo(this.map!);
      this.markers.push(marker);
    });

    if (selected) {
      this.map.setView([selected.latitude, selected.longitude], 6, { animate: true });
    }
  }
}
