import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton" [style.height.px]="height()" [style.width]="width()" role="presentation"></div>
  `,
  styles: [
    `
      .skeleton {
        display: block;
        border-radius: 10px;
        background: linear-gradient(
          90deg,
          var(--surface-alt) 0%,
          var(--border) 50%,
          var(--surface-alt) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.2s ease-in-out infinite;
      }
      @keyframes shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .skeleton { animation: none; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  readonly height = input<number>(18);
  readonly width = input<string>('100%');
}
