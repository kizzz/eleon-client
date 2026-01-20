import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EmailSettingsComponent } from '../email-settings/email-settings.component';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import {
  contributeControls,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { IdentitySettingsComponent } from '../identity-settings/identity-settings.component';
import { TimeZoneSettingsComponent } from '../time-zone-settings/time-zone-settings.component';
import { AppearanceSettingsComponent } from '../appearance-settings/appearance-settings.component';
import { GeneralTenantSettingsComponent } from '../general-settings/general-settings.component';
import { TelemetrySettingsComponent } from '../telemetry-settings/telemetry-settings.component';

type TenantSettingsTabKey =
  | 'general'
  | 'telemetry'
  | 'notifications'
  | 'identity'
  | 'time-zone'
  | 'appearance'
  | 'domains';

@Component({
  standalone: false,
  selector: 'app-settings-management',
  templateUrl: './settings-management.component.html',
  styleUrl: './settings-management.component.scss',
})
export class SettingsManagementComponent implements OnInit {
  private readonly defaultTabKey: TenantSettingsTabKey = 'general';

  @ViewChild(EmailSettingsComponent)
  public emailSettingsComponent: EmailSettingsComponent;

  @ViewChild(IdentitySettingsComponent)
  public identitySettingsComponent: IdentitySettingsComponent;

  @ViewChild(TimeZoneSettingsComponent)
  public timeZoneSettingsComponent: TimeZoneSettingsComponent;

  @ViewChild(AppearanceSettingsComponent)
  public appearanceSettingsComponent: AppearanceSettingsComponent;

  @ViewChild(GeneralTenantSettingsComponent)
  public generalTenantSettingsComponent: GeneralTenantSettingsComponent;

  @ViewChild(TelemetrySettingsComponent)
  public telemetrySettingsComponent: TelemetrySettingsComponent;

  public loading = false;
  timeZoneWidth = '100%';
  public currentTabKey: TenantSettingsTabKey = this.defaultTabKey;

  private readonly routeTypeMap: Record<string, TenantSettingsTabKey> = {
    general: 'general',
    telemetry: 'telemetry',
    notifications: 'notifications',
    identity: 'identity',
    'time-zone': 'time-zone',
    appearance: 'appearance',
    hostname: 'domains',
    domains: 'domains',
  };

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.SAVE({
      action: () => this.save(),
      show: () => this.showButtons(),
      loading: () => this.loading,
      disabled: () => this.loading,
    }),
    {
      key: 'Infrastructure::Reset',
      action: () => this.reset(),
      show: () => this.showButtons(),
      disabled: () => this.loading,
      icon: 'fa fa-refresh',
      severity: '',
      loading: () => this.loading,
    },
  ]);

  constructor(
    private msgService: LocalizedMessageService,
    private state: PageStateService,
    public activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.state.setNotDirty();
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data) => {
      const type = data['type'] as string | undefined;
      this.currentTabKey = this.resolveTabKey(type);
      this.changeDetectorRef.detectChanges();
    });
  }

  async onTabLinkClick(
    event: MouseEvent,
    targetTab: TenantSettingsTabKey
  ): Promise<void> {
    if (targetTab === this.currentTabKey) {
      return;
    }

    const canLeave = await this.ensureCanLeaveCurrentTab();

    if (!canLeave) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.state.setNotDirty();
    }
  }

  public save(): void {
    const currentComponent = this.getCurrentComponent();
    if (!currentComponent?.save) {
      return;
    }

    this.loading = true;
    currentComponent
      .save()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.state.setNotDirty();
        this.msgService.success('TenantManagement::TenantSettings:SaveSuccess');
      });
  }

  public reset(): void {
    const currentComponent = this.getCurrentComponent();
    if (!currentComponent?.reset) {
      return;
    }

    this.loading = true;
    currentComponent
      .reset()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.state.setNotDirty();
      });
  }

  private getCurrentComponent():
    | {
        save: () => Observable<unknown>;
        reset: () => Observable<unknown>;
      }
    | undefined {
    switch (this.currentTabKey) {
      case 'general':
        return this.generalTenantSettingsComponent;
      case 'telemetry':
        return this.telemetrySettingsComponent;
      case 'notifications':
        return this.emailSettingsComponent;
      case 'identity':
        return this.identitySettingsComponent;
      case 'time-zone':
        return this.timeZoneSettingsComponent;
      case 'appearance':
        return this.appearanceSettingsComponent;
      default:
        return this.generalTenantSettingsComponent;
    }
  }
  get currentTabTitle(): string {
    const currentComponent = this.getCurrentComponent();
    return currentComponent ? (currentComponent as any).title : '';
  }

  showButtons = () => {
    return this.currentTabKey !== 'domains';
  };

  private resolveTabKey(type?: string): TenantSettingsTabKey {
    if (!type) {
      return this.defaultTabKey;
    }

    return this.routeTypeMap[type] ?? this.defaultTabKey;
  }

  private async ensureCanLeaveCurrentTab(): Promise<boolean> {
    if (!this.state.isDirty) {
      return true;
    }

    const canChange = await this.state.confirmResettingDirty();

    if (!canChange) {
      this.state.setDirty();
      return false;
    }

    return true;
  }
}
