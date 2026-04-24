import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

type Handler = (event: KeyboardEvent) => void;

interface ShortcutDefinition {
  key: string;
  description: string;
  handler: Handler;
}

/**
 * Global keyboard shortcut dispatcher. Typing into inputs or textareas is
 * ignored so accessibility is preserved. Press "?" to surface the registered
 * list in a help overlay.
 */
@Injectable({ providedIn: 'root' })
export class ShortcutsService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly shortcuts = new Map<string, ShortcutDefinition>();
  readonly helpOpen = signal(false);

  constructor() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.dispatch(event));
  }

  register(key: string, description: string, handler: Handler): void {
    this.shortcuts.set(key, { key, description, handler });
  }

  unregister(key: string): void {
    this.shortcuts.delete(key);
  }

  list(): ShortcutDefinition[] {
    return [...this.shortcuts.values()];
  }

  toggleHelp(): void {
    this.helpOpen.update((v) => !v);
  }

  private dispatch(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && isTypingTarget(target)) return;

    if (event.key === '?' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      this.toggleHelp();
      return;
    }
    if (event.key === 'Escape' && this.helpOpen()) {
      this.helpOpen.set(false);
    }

    const def = this.shortcuts.get(event.key);
    if (def) {
      event.preventDefault();
      def.handler(event);
    }
  }
}

function isTypingTarget(el: HTMLElement): boolean {
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}
