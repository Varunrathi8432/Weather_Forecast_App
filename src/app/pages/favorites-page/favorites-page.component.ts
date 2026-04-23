import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

import { FavoritesListComponent } from '@app/components/favorites-list/favorites-list.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [TranslateModule, FavoritesListComponent, RouterLink],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>{{ 'favorites.title' | translate }}</h1>
        <p>{{ 'favorites.subtitle' | translate }}</p>
      </header>
      <app-favorites-list />
      <p class="hint">
        {{ 'favorites.hint' | translate }}
        <a routerLink="/">{{ 'nav.home' | translate }}</a>
      </p>
    </div>
  `,
  styles: [
    `
      .page { display: grid; gap: 1rem; }
      h1 { margin: 0 0 0.25rem; }
      p { margin: 0; color: var(--text-muted); }
      .hint a { color: var(--primary); text-decoration: none; font-weight: 600; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPageComponent {}
