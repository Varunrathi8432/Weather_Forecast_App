import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ChildrenOutletContexts, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ThemeService } from './core/theme.service';
import { PreferencesService } from './core/preferences.service';
import { ErrorToastComponent } from './components/error-toast/error-toast.component';
import { OfflineBannerComponent } from './components/offline-banner/offline-banner.component';
import { InstallBannerComponent } from './components/install-banner/install-banner.component';
import { ShortcutHelpComponent } from './components/shortcut-help/shortcut-help.component';
import { ShortcutsService } from './core/shortcuts.service';
import { routeFade } from './core/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
    ErrorToastComponent,
    OfflineBannerComponent,
    InstallBannerComponent,
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

  constructor() {
    this.translate.addLangs(['en', 'es', 'fr']);
    this.translate.use(this.prefs.language());
    effect(() => {
      const lang = this.prefs.language();
      this.translate.use(lang);
      document.documentElement.lang = lang;
    });

    this.shortcuts.register('/', 'Focus the search bar', () => {
      const el = document.getElementById('city-input');
      (el as HTMLInputElement | null)?.focus();
    });
    this.shortcuts.register('t', 'Toggle light / dark theme', () => this.theme.toggle());
    this.shortcuts.register('u', 'Toggle metric / imperial units', () => this.prefs.toggleUnits());
  }

  getAnimation(): string {
    return this.outletContexts.getContext('primary')?.route?.snapshot?.data?.['animation'] ?? '';
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  selectLanguage(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'en' | 'es' | 'fr';
    this.prefs.setLanguage(value);
  }
}
