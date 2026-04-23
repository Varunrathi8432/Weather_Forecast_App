import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="card" aria-hidden="true">
      <app-skeleton [height]="24" width="40%" />
      <app-skeleton [height]="12" width="25%" />
      <div class="main">
        <app-skeleton [height]="64" width="64px" />
        <div class="right">
          <app-skeleton [height]="44" width="55%" />
          <app-skeleton [height]="14" width="40%" />
        </div>
      </div>
      <div class="stats">
        <app-skeleton [height]="60" />
        <app-skeleton [height]="60" />
        <app-skeleton [height]="60" />
        <app-skeleton [height]="60" />
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 1.5rem;
        display: grid;
        gap: 0.75rem;
      }
      .main {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 0.5rem;
      }
      .main .right {
        flex: 1;
        display: grid;
        gap: 0.5rem;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCardComponent {}
