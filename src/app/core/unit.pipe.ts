import { Pipe, PipeTransform, inject } from '@angular/core';

import { PreferencesService } from './preferences.service';

type Kind = 'temp' | 'wind' | 'precip' | 'distance' | 'pressure';

@Pipe({ name: 'unit', standalone: true, pure: false })
export class UnitPipe implements PipeTransform {
  private readonly prefs = inject(PreferencesService);

  transform(value: number | null | undefined, kind: Kind = 'temp', digits = 0): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const units = this.prefs.units();
    const rounded = value.toFixed(digits);
    switch (kind) {
      case 'temp':
        return `${rounded}${units === 'imperial' ? '°F' : '°C'}`;
      case 'wind':
        return `${rounded} ${units === 'imperial' ? 'mph' : 'km/h'}`;
      case 'precip':
        return `${value.toFixed(Math.max(1, digits))} ${units === 'imperial' ? 'in' : 'mm'}`;
      case 'distance':
        return `${rounded} ${units === 'imperial' ? 'mi' : 'km'}`;
      case 'pressure':
        return `${rounded} hPa`;
      default:
        return rounded;
    }
  }
}
