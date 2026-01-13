import { Component, OnInit } from "@angular/core";
import { TenantAppearanceService } from '@eleon/tenant-management-proxy';
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { PageStateService } from "@eleon/primeng-ui.lib";
import { FileUploadEvent } from "primeng/fileupload";
import {
  Observable,
  finalize,
  from,
  map,
  switchMap,
  tap,
} from "rxjs";
import { IAppearanceService, DEFAULT_IMAGES } from '@eleon/angular-sdk.lib'
@Component({
  standalone: false,
  selector: "app-appearance-settings",
  templateUrl: "./appearance-settings.component.html",
  styleUrl: "./appearance-settings.component.scss",
})
export class AppearanceSettingsComponent implements OnInit {
  public loading = false;
  public lightLogoSrc: string;
  title = "TenantManagement::TenantSettings:AppearanceSettings";
  public lightIconSrc: string;
  public darkLogoSrc: string;
  public darkIconSrc: string;

  constructor(
    public state: PageStateService,
    public tenantAppearanceService: TenantAppearanceService,
    public appearanceService: IAppearanceService,
    private fileHelper: FileHelperService
  ) {}

  public ngOnInit(): void {
    this.loadSettings().subscribe();
  }

  public save(): Observable<void> {
    return this.tenantAppearanceService
      .updateTenantAppearanceSettingsByRequest({
        lightIcon: this.toBase64(this.lightIconSrc),
        lightLogo: this.toBase64(this.lightLogoSrc),
        darkIcon: this.toBase64(this.darkIconSrc),
        darkLogo: this.toBase64(this.darkLogoSrc),
      })
      .pipe(switchMap(() => from(this.appearanceService.update())))
      .pipe(finalize(()=> this.state.setNotDirty()))
  }

  public reset(): Observable<void> {
    this.state.setNotDirty();
    return this.loadSettings();
  }

  public async uploadLightLogo(event: FileUploadEvent): Promise<void> {
    this.state.setDirty();
    this.lightLogoSrc = this.fileHelper.base64ToDataURL(
      "application/image",
      await this.fileHelper.fileToBase64(event.files[0])
    );
  }

  public resetLightLogo(): void {
    this.state.setDirty();
    this.lightLogoSrc = DEFAULT_IMAGES.lightLogo;
  }

  public async uploadDarkLogo(event: FileUploadEvent): Promise<void> {
    this.state.setDirty();
    this.darkLogoSrc = this.fileHelper.base64ToDataURL(
      "application/image",
      await this.fileHelper.fileToBase64(event.files[0])
    );
  }

  public resetDarkLogo(): void {
    this.state.setDirty();
    this.darkLogoSrc = DEFAULT_IMAGES.darkLogo;
  }

  public async uploadDarkIcon(event: FileUploadEvent): Promise<void> {
    this.state.setDirty();
    this.darkIconSrc = this.fileHelper.base64ToDataURL(
      "application/image",
      await this.fileHelper.fileToBase64(event.files[0])
    );
  }

  public resetDarkIcon(): void {
    this.state.setDirty();
    this.darkIconSrc = DEFAULT_IMAGES.darkIcon;
  }

  public async uploadLightIcon(event: FileUploadEvent): Promise<void> {
    this.state.setDirty();
    this.lightIconSrc = this.fileHelper.base64ToDataURL(
      "application/image",
      await this.fileHelper.fileToBase64(event.files[0])
    );
  }

  public resetLightIcon(): void {
    this.state.setDirty();
    this.lightIconSrc = DEFAULT_IMAGES.lightIcon;
  }

  private toBase64(dataUrl: string): string {
    if (dataUrl.startsWith("data:")) {
      return this.fileHelper.dataUrlToBase64(dataUrl);
    }

    return null;
  }

  private loadSettings(): Observable<void> {
    this.loading = true;
    return this.appearanceService
      .getSettings()
      .pipe(finalize(() => (this.loading = false)))
      .pipe(
        map((settings) => {
          this.lightLogoSrc = settings.lightLogo;
          this.lightIconSrc = settings.lightIcon;
          this.darkLogoSrc = settings.darkLogo;
          this.darkIconSrc = settings.darkIcon;
        })
      );
  }
}
