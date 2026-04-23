import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

/**
 * Captures Chromium's `beforeinstallprompt` event so the app can offer an
 * "Install" affordance at a moment that makes sense (not on first paint).
 */
@Injectable({ providedIn: 'root' })
export class InstallPromptService {
  private readonly destroyRef = inject(DestroyRef);
  private deferred: BeforeInstallPromptEvent | null = null;
  private readonly _canInstall = signal(false);
  readonly canInstall = this._canInstall.asReadonly();

  constructor() {
    fromEvent<BeforeInstallPromptEvent>(window, 'beforeinstallprompt')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        event.preventDefault();
        this.deferred = event;
        this._canInstall.set(true);
      });

    fromEvent(window, 'appinstalled')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.deferred = null;
        this._canInstall.set(false);
      });
  }

  async prompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferred) return 'unavailable';
    await this.deferred.prompt();
    const choice = await this.deferred.userChoice;
    this.deferred = null;
    this._canInstall.set(false);
    return choice.outcome;
  }
}
