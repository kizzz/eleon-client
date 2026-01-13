import { Component } from '@angular/core';
import { SystemLogLevel } from '@eleon/system-log-proxy';
import { IApplicationConfigurationManager, ILocalizationService } from '@eleon/angular-sdk.lib';
import { ActivatedRoute } from '@angular/router'

abstract class LogsPageComponentBase {
  protected abstract readonly routeKey: LogsRouteKey;

  protected currentUserId: string | undefined = undefined;

  readonly rowsCount = 50;
  systemLogLevel = SystemLogLevel;

  protected readonly routeMeta: LogsRouteMeta = {
    system: { title: 'Infrastructure::SystemLogs', icon: 'fas fa-list-check' },
    systemalerts: { title: 'Infrastructure::SystemAlerts', icon: 'fas fa-list-check' },
    audit: { title: 'Infrastructure::AuditLogs', icon: 'fas fa-file-contract' },
    requests: { title: 'Infrastructure::RequestLogs', icon: 'fas fa-globe' },
    security: { title: 'Infrastructure::SecurityLogs', icon: 'fas fa-shield-halved' },
  };

  protected constructor(private readonly localizationService: ILocalizationService) {}

  get pageTitle(): string {
    const meta = this.routeMeta[this.routeKey];
    return this.localizationService.instant(meta.title);
  }

  get pageIcon(): string {
    return this.routeMeta[this.routeKey].icon;
  }

  get currentRoute(): LogsRouteKey {
    return this.routeKey;
  }
}

@Component({
  standalone: false,
  selector: 'app-system-logs-page',
  templateUrl: './logs-dashboard.component.html',
  styleUrls: ['./logs-dashboard.component.scss'],
})
export class SystemLogsPageComponent extends LogsPageComponentBase {
  protected readonly routeKey: LogsRouteKey = 'system';

  constructor(localizationService: ILocalizationService) {
    super(localizationService);
  }
}

@Component({
  standalone: false,
  selector: 'app-system-alerts-page',
  templateUrl: './logs-dashboard.component.html',
  styleUrls: ['./logs-dashboard.component.scss'],
})
export class SystemAlertsPageComponent extends LogsPageComponentBase {
  protected readonly routeKey: LogsRouteKey = 'systemalerts';

  constructor(localizationService: ILocalizationService) {
    super(localizationService);
  }
}

@Component({
  standalone: false,
  selector: 'app-audit-logs-page',
  templateUrl: './logs-dashboard.component.html',
  styleUrls: ['./logs-dashboard.component.scss'],
})
export class AuditLogsPageComponent extends LogsPageComponentBase {
  protected readonly routeKey: LogsRouteKey = 'audit';

  constructor(localizationService: ILocalizationService) {
    super(localizationService);
  }
}

@Component({
  standalone: false,
  selector: 'app-request-logs-page',
  templateUrl: './logs-dashboard.component.html',
  styleUrls: ['./logs-dashboard.component.scss'],
})
export class RequestLogsPageComponent extends LogsPageComponentBase {
  protected readonly routeKey: LogsRouteKey = 'requests';

  constructor(localizationService: ILocalizationService) {
    super(localizationService);
  }
}

@Component({
  standalone: false,
  selector: 'app-security-logs-page',
  templateUrl: './logs-dashboard.component.html',
  styleUrls: ['./logs-dashboard.component.scss'],
})
export class SecurityLogsPageComponent extends LogsPageComponentBase {
  protected readonly routeKey: LogsRouteKey = 'security';

  constructor(localizationService: ILocalizationService, private readonly appConfig: IApplicationConfigurationManager, private readonly activatedRoute: ActivatedRoute) {
    super(localizationService);
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    if (this.activatedRoute.snapshot.params.user){
      this.currentUserId = this.appConfig.getAppConfig()?.currentUser?.id;
    }
  }
}

@Component({
  standalone: false,
  selector: 'app-security-logs-page',
  templateUrl: './logs-dashboard.component.html',
  styleUrls: ['./logs-dashboard.component.scss'],
})
export class UserSecurityLogsPageComponent extends LogsPageComponentBase {
  protected readonly routeKey: LogsRouteKey = 'security';

  constructor(localizationService: ILocalizationService, private readonly appConfig: IApplicationConfigurationManager) {
    super(localizationService);
  }

  ngOnInit(): void {
    this.currentUserId = this.appConfig.getAppConfig()?.currentUser?.id;
  }
}


type LogsRouteKey = 'system' | 'systemalerts' | 'audit' | 'requests' | 'security';

interface LogsRouteMetaItem {
  title: string;
  icon: string;
}

type LogsRouteMeta = Record<LogsRouteKey, LogsRouteMetaItem>;

  
