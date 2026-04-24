import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { listStagger } from '@core/animations/animations';
import { ActivitySuggestion } from '@core/models/weather.model';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [DecimalPipe, TranslateModule],
  animations: [listStagger],
  template: `
    <section class="suggestions" [attr.aria-label]="'suggestions.heading' | translate">
      <header>
        <h2>{{ 'suggestions.heading' | translate }}</h2>
        <span class="tag" title="Rule-based activity scoring">{{ 'suggestions.tag' | translate }}</span>
      </header>
      @if (items().length === 0) {
        <p class="empty">{{ 'suggestions.empty' | translate }}</p>
      } @else {
        <ul @listStagger>
          @for (s of items(); track s.id) {
            <li>
              <span class="icon" aria-hidden="true">{{ s.icon }}</span>
              <div class="body">
                <div class="title-row">
                  <strong>{{ s.title }}</strong>
                  <span class="score" [attr.aria-label]="'Fit score ' + ((s.score * 100) | number:'1.0-0') + '%'">
                    {{ s.score * 100 | number: '1.0-0' }}%
                  </span>
                </div>
                <p>{{ s.rationale }}</p>
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
      :host { display: block; min-width: 0; }
      .suggestions {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem 1.1rem;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      h2 { margin: 0; font-size: 1.05rem; }
      .tag {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 0.15rem 0.5rem;
        color: var(--text-muted);
      }
      .empty {
        color: var(--text-muted);
        margin: 0;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.5rem;
      }
      li {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 0.65rem 0.75rem;
        border-radius: 10px;
        background: var(--surface-alt);
        border: 1px solid var(--border);
      }
      .icon { font-size: 1.35rem; line-height: 1; flex-shrink: 0; }
      .body { flex: 1; min-width: 0; }
      .title-row {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        align-items: baseline;
        flex-wrap: wrap;
      }
      strong { word-break: break-word; }
      .score { color: var(--primary); font-weight: 700; font-size: 0.9rem; }
      p { margin: 0.2rem 0 0; color: var(--text-muted); font-size: 0.9rem; }
      @media (max-width: 480px) {
        .suggestions { padding: 0.85rem 0.95rem; }
        li { padding: 0.55rem 0.65rem; gap: 0.5rem; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionsComponent {
  readonly items = input.required<ActivitySuggestion[]>();
}
