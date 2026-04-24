import { Injectable, inject } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

/**
 * Thin wrapper over CDK's LiveAnnouncer so tests and components can mock it
 * without pulling in the full module. Announces into a polite aria-live region
 * so screen readers hear data updates without hijacking focus.
 */
@Injectable({ providedIn: 'root' })
export class AnnouncerService {
  private readonly live = inject(LiveAnnouncer);

  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    void this.live.announce(message, politeness);
  }
}
