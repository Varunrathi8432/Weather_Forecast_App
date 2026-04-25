import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { HourlyForecastEntry } from '@core/models/weather.model';
import { PreferencesService } from '@core/services/preferences.service';

Chart.register(...registerables);

@Component({
  selector: 'app-hourly-chart',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <section class="hourly" [attr.aria-label]="'hourly.heading' | translate">
      <h2>{{ 'hourly.heading' | translate }}</h2>
      <div class="canvas-wrap">
        <canvas #canvas role="img" [attr.aria-label]="'hourly.ariaLabel' | translate"></canvas>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; min-width: 0; }
      h2 { font-size: 1.1rem; margin: 0 0 0.75rem; }
      .canvas-wrap {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 0.75rem;
        height: clamp(200px, 40vw, 280px);
        position: relative;
      }
      .canvas-wrap canvas {
        width: 100% !important;
        height: 100% !important;
        max-width: 100%;
      }
      @media (max-width: 480px) {
        .canvas-wrap { padding: 0.5rem; height: 220px; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HourlyChartComponent implements AfterViewInit, OnDestroy {
  private readonly prefs = inject(PreferencesService);
  private readonly translate = inject(TranslateService);
  readonly hourly = input.required<HourlyForecastEntry[]>();
  readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private chart?: Chart;

  constructor() {
    effect(() => {
      const data = this.hourly();
      if (this.chart) this.updateChart(data);
    });
    this.translate.onLangChange.subscribe(() => {
      if (this.chart) this.updateChart(this.hourly());
    });
  }

  private tempLabel(): string {
    return this.translate.instant('hourly.tempLabel', {
      unit: this.prefs.units() === 'imperial' ? '°F' : '°C',
    });
  }

  private precipLabel(): string {
    return this.translate.instant('hourly.precipLabel');
  }

  ngAfterViewInit(): void {
    this.createChart(this.hourly());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(data: HourlyForecastEntry[]): void {
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: data.map((h) => new Date(h.time).getHours() + 'h'),
        datasets: [
          {
            label: this.tempLabel(),
            data: data.map((h) => h.temperature),
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
            tension: 0.35,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: this.precipLabel(),
            data: data.map((h) => h.precipitationProbability),
            borderColor: '#26a69a',
            backgroundColor: 'rgba(38, 166, 154, 0.15)',
            borderDash: [5, 5],
            tension: 0.3,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: { type: 'linear', position: 'left' },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            min: 0,
            max: 100,
          },
        },
      },
    };
    this.chart = new Chart(this.canvas().nativeElement, config);
  }

  private updateChart(data: HourlyForecastEntry[]): void {
    if (!this.chart) return;
    this.chart.data.labels = data.map((h) => new Date(h.time).getHours() + 'h');
    this.chart.data.datasets[0].data = data.map((h) => h.temperature);
    this.chart.data.datasets[0].label = this.tempLabel();
    this.chart.data.datasets[1].data = data.map((h) => h.precipitationProbability);
    this.chart.data.datasets[1].label = this.precipLabel();
    this.chart.update();
  }
}
