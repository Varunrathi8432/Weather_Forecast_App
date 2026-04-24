import { TestBed } from '@angular/core/testing';

import { ShortcutsService } from './shortcuts.service';

describe('ShortcutsService', () => {
  let svc: ShortcutsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ShortcutsService] });
    svc = TestBed.inject(ShortcutsService);
  });

  it('fires handlers for registered keys', () => {
    const handler = jasmine.createSpy('handler');
    svc.register('g', 'go home', handler);

    const event = new KeyboardEvent('keydown', { key: 'g' });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
  });

  it('ignores shortcuts while typing in inputs', () => {
    const handler = jasmine.createSpy('handler');
    svc.register('x', 'x', handler);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    input.remove();
  });

  it('toggles the help overlay on "?"', () => {
    expect(svc.helpOpen()).toBeFalse();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    expect(svc.helpOpen()).toBeTrue();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(svc.helpOpen()).toBeFalse();
  });
});
