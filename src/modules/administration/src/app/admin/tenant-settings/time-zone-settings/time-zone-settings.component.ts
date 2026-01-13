import { Component, Input, OnInit } from "@angular/core";
import { IdentitySettingService, TimeZoneSettingsService } from '@eleon/tenant-management-proxy';
import {
  IdentitySettingDto,
  IdentitySettingType,
} from '@eleon/tenant-management-proxy';
import { Observable, map, finalize, combineLatestWith } from "rxjs";
import { PageStateService } from "@eleon/primeng-ui.lib";

export interface NameValue<T = "string"> {
  name?: string;
  value: T;
}


@Component({
  standalone: false,
  selector: "app-time-zone-settings",
  templateUrl: "./time-zone-settings.component.html",
  styleUrl: "./time-zone-settings.component.scss",
})
export class TimeZoneSettingsComponent implements OnInit {
  public timezones: NameValue<string>[];
  public selectedTimezone: string;
  public loading = false;
  title = "TenantManagement::TenantSettings:TimeZoneSettings";

  @Input()
  width: string='100%'
  constructor(
    private timeZoneService: TimeZoneSettingsService,
    public state: PageStateService
  ) {}

  public ngOnInit(): void {
    this.loadSettings().subscribe();
  }

  public save(): Observable<void> {
    return this.timeZoneService.update(this.selectedTimezone);
  }

  public reset(): Observable<void> {
    return this.loadSettings();
  }

  private loadSettings(): Observable<void> {
    this.loading = true;
    return this.timeZoneService
      .getTimezones()
      .pipe(combineLatestWith(this.timeZoneService.get()))
      .pipe(finalize(() => (this.loading = false)))
      .pipe(
        map(([timezones, timezone]) => {
          this.selectedTimezone = timezone;
          this.timezones = timezones;
        })
      );
  }
}
