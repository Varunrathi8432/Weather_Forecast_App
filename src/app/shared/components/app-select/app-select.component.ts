import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
  OverlayModule,
} from '@angular/cdk/overlay';

export interface AppSelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Reusable dropdown built on Angular CDK Overlay.
 *
 * Usage:
 *   <app-select
 *     [options]="langs"
 *     [value]="prefs.language()"
 *     (valueChange)="prefs.setLanguage($event)"
 *     ariaLabel="Language"
 *   />
 *
 * Works with ngModel / FormControl via ControlValueAccessor.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [OverlayModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true,
    },
  ],
  template: `
    <button
      #trigger
      type="button"
      class="trigger"
      cdkOverlayOrigin
      [class.has-label]="!!label()"
      [attr.aria-label]="ariaLabel() || label() || null"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="open()"
      [disabled]="disabled()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      @if (label()) {
        <span class="lbl">{{ label() }}</span>
      }
      <span class="val" [class.placeholder]="!selectedLabel()">
        {{ selectedLabel() || placeholder() }}
      </span>
      <span class="chevron" aria-hidden="true" [class.open]="open()">
        <svg viewBox="0 0 20 20" focusable="false">
          <path
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="app-select-backdrop"
      [cdkConnectedOverlayOffsetY]="6"
      [cdkConnectedOverlayMinWidth]="triggerWidth()"
      [cdkConnectedOverlayFlexibleDimensions]="false"
      [cdkConnectedOverlayGrowAfterOpen]="true"
      (backdropClick)="close()"
      (detach)="close()"
      (overlayKeydown)="onPanelKeydown($event)"
    >
      <ul
        #panel
        class="panel"
        role="listbox"
        [attr.aria-label]="ariaLabel() || label() || null"
      >
        @for (opt of options(); track opt.value; let i = $index) {
          <li
            class="option"
            role="option"
            [attr.aria-selected]="opt.value === value()"
            [attr.aria-disabled]="opt.disabled ? 'true' : null"
            [class.selected]="opt.value === value()"
            [class.active]="i === activeIndex()"
            [class.disabled]="opt.disabled"
            [attr.tabindex]="opt.disabled ? -1 : 0"
            (click)="onSelect(opt, i)"
            (mouseenter)="setActive(i)"
          >
            <span class="check" aria-hidden="true">
              @if (opt.value === value()) {
                <svg viewBox="0 0 20 20" focusable="false">
                  <path
                    d="M7.5 13.5l-3-3a.75.75 0 011.06-1.06l2.44 2.44 5.44-5.44a.75.75 0 011.06 1.06l-6 6a.75.75 0 01-1.06 0z"
                    fill="currentColor"
                  />
                </svg>
              }
            </span>
            <span class="opt-label">{{ opt.label }}</span>
          </li>
        }
      </ul>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        min-width: 0;
        width: 100%;
      }

      .trigger {
        width: 100%;
        min-height: 2.25rem;
        padding: 0.35rem 0.55rem 0.35rem 0.75rem;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: var(--surface-alt);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 10px;
        font: inherit;
        font-size: 0.9rem;
        line-height: 1;
        cursor: pointer;
        text-align: left;
        transition: border-color 120ms ease, box-shadow 120ms ease,
          background 120ms ease;
      }

      .trigger:hover:not(:disabled) {
        border-color: var(--primary);
      }

      .trigger:focus-visible {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--focus-ring);
      }

      .trigger[aria-expanded='true'] {
        border-color: var(--primary);
      }

      .trigger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .lbl {
        color: var(--text-muted);
        font-size: 0.78rem;
        font-weight: 500;
        white-space: nowrap;
      }

      .val {
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
      }

      .val.placeholder { color: var(--text-muted); font-weight: 400; }

      .chevron {
        display: inline-flex;
        flex-shrink: 0;
        width: 1rem;
        height: 1rem;
        color: var(--text-muted);
        transition: transform 160ms ease, color 160ms ease;
      }
      .chevron svg { width: 100%; height: 100%; }
      .chevron.open {
        transform: rotate(180deg);
        color: var(--primary);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSelectComponent<T extends string | number = string>
  implements ControlValueAccessor
{
  readonly options = input.required<AppSelectOption<T>[]>();
  readonly value = input<T | null>(null);
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<T>();
  readonly openedChange = output<boolean>();

  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  private readonly _open = signal(false);
  readonly open = this._open.asReadonly();

  private readonly _activeIndex = signal(-1);
  readonly activeIndex = this._activeIndex.asReadonly();

  private readonly _triggerWidth = signal<number>(0);
  readonly triggerWidth = this._triggerWidth.asReadonly();

  readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
  ];

  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  readonly selectedLabel = computed(() => {
    const v = this.value();
    return this.options().find((o) => o.value === v)?.label ?? null;
  });

  toggle(): void {
    if (this.disabled()) return;
    this._open() ? this.close() : this.openPanel();
  }

  openPanel(): void {
    if (this._open()) return;
    const width = this.triggerRef().nativeElement.offsetWidth;
    this._triggerWidth.set(Math.max(width, 160));
    const currentIdx = this.options().findIndex((o) => o.value === this.value());
    this._activeIndex.set(currentIdx >= 0 ? currentIdx : 0);
    this._open.set(true);
    this.openedChange.emit(true);
  }

  close(): void {
    if (!this._open()) return;
    this._open.set(false);
    this.onTouched();
    this.openedChange.emit(false);
    queueMicrotask(() => this.triggerRef().nativeElement.focus());
  }

  setActive(index: number): void {
    this._activeIndex.set(index);
  }

  onSelect(opt: AppSelectOption<T>, _i: number): void {
    if (opt.disabled) return;
    this.onChange(opt.value);
    this.valueChange.emit(opt.value);
    this.close();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.openPanel();
        break;
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    const opts = this.options();
    if (opts.length === 0) return;

    switch (event.key) {
      case 'Escape':
      case 'Tab':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowDown': {
        event.preventDefault();
        const next = this.nextEnabled(this._activeIndex(), 1);
        if (next >= 0) this._activeIndex.set(next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = this.nextEnabled(this._activeIndex(), -1);
        if (prev >= 0) this._activeIndex.set(prev);
        break;
      }
      case 'Home':
        event.preventDefault();
        this._activeIndex.set(this.nextEnabled(-1, 1));
        break;
      case 'End':
        event.preventDefault();
        this._activeIndex.set(this.nextEnabled(opts.length, -1));
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const idx = this._activeIndex();
        const opt = opts[idx];
        if (opt) this.onSelect(opt, idx);
        break;
      }
    }
  }

  private nextEnabled(fromIndex: number, direction: 1 | -1): number {
    const opts = this.options();
    const len = opts.length;
    if (len === 0) return -1;
    let i = fromIndex;
    for (let step = 0; step < len; step++) {
      i = (i + direction + len) % len;
      if (!opts[i].disabled) return i;
    }
    return -1;
  }

  writeValue(_value: T): void {
    // Value is driven by the `value` input signal; CVA is supported for forms.
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // Disabled state is driven by the `disabled` input.
  }
}
