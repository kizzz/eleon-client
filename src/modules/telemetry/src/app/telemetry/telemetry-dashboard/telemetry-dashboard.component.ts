import { Component, OnDestroy, OnInit, signal, ViewChild } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LocalizedConfirmationService, LocalizedMessageService } from '@eleon/primeng-ui.lib'; 
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from 'rxjs'
import { contributeControls, PageControls } from '@eleon/primeng-ui.lib'

import { ILayoutService, ILocalizationService } from '@eleon/angular-sdk.lib';


@Component({
  standalone: false,
  selector: "app-telemetry-dashboard",
  templateUrl: "./telemetry-dashboard.component.html",
  styleUrls: ["./telemetry-dashboard.component.scss"],
})
export class TelemetryDashboardComponent implements OnInit, OnDestroy {
  grafanaUrl: SafeResourceUrl;
unsafeGrafanaUrl: string;
  iframeLoadError = false;

  theme = 'light';
  currentDashboard = 'logs';

  grafanaUrlConfg = {
    logs: 'd/telemetry-loki/telemetry-loki-logs',
    traces: 'd/telemetry-tempo/telemetry-tempo-traces',
    metrics: 'd/telemetry-prom/telemetry-prometheus-overview',
    settings: 'admin',
  }

  static defaultUrl = 'd/telemetry-loki/telemetry-loki-logs';


  constructor(
    public localizationService: ILocalizationService,
		private confirmationService: LocalizedConfirmationService,
		private messageService: LocalizedMessageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private layoutService: ILayoutService,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit(): void {
    this.layoutService.config.update((config) => {
      this.theme = config.theme && config.theme.includes('dark') ? 'dark' : 'light';

      this.updateGrafanaUrl();

      return {
        ...config,
        menuMode: 'horizontal',
        isFullWidth: true,
        isSave: false,
      }
    });

    this.layoutService.configUpdate$.subscribe(cfg => {
      const prevTheme = this.theme;
      if (cfg.theme && cfg.theme.includes('dark')) {
        this.theme = 'dark';
      }
      else {
        this.theme = 'light';
      }
      if (prevTheme !== this.theme){
        this.updateGrafanaUrl();
      }
    });

    this.activatedRoute.data.subscribe(data => {
      this.updateGrafanaUrl(data['dashboard']);
    });
  }
  
  ngOnDestroy(): void {
    this.layoutService.resetLayout().subscribe(res => {
    })
  }

  private updateGrafanaUrl(dashboard?: string) {
    if (!dashboard) {
      dashboard = this.currentDashboard || 'logs';
    }

    this.currentDashboard = dashboard;

    const basePath = '/telemetry/grafana/';

    const dashboardPath = this.grafanaUrlConfg[dashboard as keyof typeof this.grafanaUrlConfg] || TelemetryDashboardComponent.defaultUrl;

    const queryObject = {
      orgId: '1',
      from: 'now-30m',
      to: 'now',
      timezone: 'browser',
      refresh: '5m',
      theme: this.theme,
      kiosk: 'tv',
    };

    const url = `${basePath}${dashboardPath}?${new URLSearchParams(queryObject as any).toString()}`;

    this.grafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.unsafeGrafanaUrl = url;
    this.iframeLoadError = false;

    this.tryGrafana();
  }

  onIframeError() {
    this.iframeLoadError = true;
  }

  tryGrafana(){
    fetch(this.unsafeGrafanaUrl).then(response => {
      if (response.status < 400) {
        this.iframeLoadError = false;
      } else {
        this.iframeLoadError = true;
      }
    }).catch(() => this.iframeLoadError = true);
  }
}
