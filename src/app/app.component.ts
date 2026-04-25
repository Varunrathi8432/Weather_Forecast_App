import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ChildrenOutletContexts, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ThemeService } from '@core/services/theme.service';
import { PreferencesService } from '@core/services/preferences.service';
import { LoadingService } from '@core/services/loading.service';
import { ErrorToastComponent } from '@shared/components/error-toast/error-toast.component';
import { OfflineBannerComponent } from '@shared/components/offline-banner/offline-banner.component';
import { ShortcutHelpComponent } from '@features/shortcuts/shortcut-help/shortcut-help.component';
import { ShortcutsService } from '@core/services/shortcuts.service';
import { routeFade } from '@core/animations/animations';
import { AppSelectComponent } from '@shared/components/app-select/app-select.component';
import type { AppSelectOption } from '@shared/components/app-select/app-select.component';
import type { Language } from '@core/models/weather.model';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
    AppSelectComponent,
    ErrorToastComponent,
    OfflineBannerComponent,
    ShortcutHelpComponent,
  ],
  animations: [routeFade],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly translate = inject(TranslateService);
  private readonly outletContexts = inject(ChildrenOutletContexts);
  private readonly shortcuts = inject(ShortcutsService);
  protected readonly theme = inject(ThemeService);
  protected readonly prefs = inject(PreferencesService);
  protected readonly loading = inject(LoadingService);

  private readonly langChange = toSignal(this.translate.onLangChange);

  protected readonly languageOptions = computed<AppSelectOption<Language>[]>(() => {
    this.langChange();
    this.prefs.language();
    return (['en', 'es', 'fr', 'hi'] as const).map((code) => ({
      value: code,
      label: this.translate.instant(`languages.${code}`),
    }));
  });

  constructor() {
    this.translate.addLangs(['en', 'es', 'fr', 'hi']);
    this.translate.use(this.prefs.language());
    effect(() => {
      const lang = this.prefs.language();
      this.translate.use(lang);
      document.documentElement.lang = lang;
    });

    this.shortcuts.register('/', 'shortcuts.focusSearch', () => {
      const el = document.getElementById('city-input');
      (el as HTMLInputElement | null)?.focus();
    });
    this.shortcuts.register('t', 'shortcuts.toggleTheme', () => this.theme.toggle());
    this.shortcuts.register('u', 'shortcuts.toggleUnits', () => this.prefs.toggleUnits());
  }

  getAnimation(): string {
    return this.outletContexts.getContext('primary')?.route?.snapshot?.data?.['animation'] ?? '';
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
