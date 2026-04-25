import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ConfigService } from './config.service';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
  private readonly swPush = inject(SwPush);
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly errors = inject(ErrorService);
  private readonly translate = inject(TranslateService);

  readonly subscribed = signal(false);

  get supported(): boolean {
    return this.swPush.isEnabled && !!this.config.get('vapidPublicKey');
  }

  async subscribe(): Promise<void> {
    if (!this.supported) {
      this.errors.push(this.translate.instant('errors.pushNotConfigured'));
      return;
    }
    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.config.get('vapidPublicKey'),
      });
      const url = this.config.get('pushServerUrl');
      if (url) {
        await firstValueFrom(this.http.post(url, sub));
      }
      this.subscribed.set(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : this.translate.instant('errors.pushSubscribeFailed');
      this.errors.push(message);
    }
  }

  async unsubscribe(): Promise<void> {
    try {
      await this.swPush.unsubscribe();
      this.subscribed.set(false);
    } catch {
      // ignore
    }
  }
}
