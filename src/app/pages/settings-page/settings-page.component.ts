import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PreferencesService } from '@app/core/preferences.service';
import { ThemeService } from '@app/core/theme.service';
import { PushNotificationsService } from '@app/core/push-notifications.service';
import { ConfigService } from '@app/core/config.service';
import { ShortcutsService } from '@app/core/shortcuts.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  protected readonly prefs = inject(PreferencesService);
  protected readonly theme = inject(ThemeService);
  protected readonly push = inject(PushNotificationsService);
  protected readonly config = inject(ConfigService);
  protected readonly shortcuts = inject(ShortcutsService);

  togglePush(): void {
    if (this.push.subscribed()) {
      void this.push.unsubscribe();
    } else {
      void this.push.subscribe();
    }
  }
}
