import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { IApplicationConfigurationManager, ILightweightStorageService } from '@eleon/angular-sdk.lib';
import { IProfileService } from '@eleon/angular-sdk.lib';
import { Observable, finalize, map } from "rxjs";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { ImageCropperResult } from "./user-image-picker/user-image-picker.component";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { ProfilePictureService } from "@eleon/primeng-ui.lib";

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-user-profile-picture-settings",
  templateUrl: "./user-profile-picture-settings.component.html",
  styleUrl: "./user-profile-picture-settings.component.scss",
})
export class UserProfilePictureSettingsComponent implements OnInit {
  @ViewChild("fileInput", { static: true }) fileUpload: ElementRef;

  public profilePictureSrc: string;
  public profilePictureThumbnailSrc: string;

  public editingPictureSrc: string;

  public saving: boolean = false;
  public removing: boolean = false;
  public loading: boolean = false;

  constructor(
    private storageService: ILightweightStorageService,
    private profilePictureService: IProfileService,
    private config: IApplicationConfigurationManager,
    private fileHelper: FileHelperService,
    private localizationService: ILocalizationService,
    private msgService: LocalizedMessageService,
    private confirmaionService: LocalizedConfirmationService,
    private currentUserProfilePictureService: ProfilePictureService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.loading = true;
			try{
				let pp = await this.storageService.getFile(
				"TenantManagement;" +
					this.config.getAppConfig().currentUser?.id +
					"-fullAvatar"
			);

			if (!pp){
				this.profilePictureSrc = await this.currentUserProfilePictureService.getProfilePicture(this.config.getAppConfig().currentUser?.id);
			}
			else{
				this.setProfilePictureSrc(pp);
			}
		} finally {
			this.loading = false;
		}
  }

  public onEdit(): void {
    this.fileUpload.nativeElement.click();
  }

  public async onClear(): Promise<void> {
    const confirmed = await this.confirmaionService.confirmAsync(
      "TenantManagement::ProfilePictureSettings:ConfirmClear"
    );
    if (!confirmed) {
      return;
    }

    this.profilePictureSrc = null;
    this.profilePictureThumbnailSrc = null;
    this.editingPictureSrc = null;

    this.removing = true;
    this.save()
      .pipe(finalize(() => (this.removing = false)))
      .subscribe();
  }

  public onCropCanceled(): void {
    this.editingPictureSrc = null;
  }

  public onCropped(event: ImageCropperResult): void {
    this.profilePictureSrc = event.highQualityDataUrl;
    this.profilePictureThumbnailSrc = event.lowQualityDataUrl;
    this.editingPictureSrc = null;

    this.saving = true;
    this.save()
      .pipe(finalize(() => (this.saving = false)))
      .subscribe();
  }

  public async uploadFile(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    const dataUrl = await this.fileHelper.fileToDataUrl(file);
    this.editingPictureSrc = dataUrl;
    target.value = null;
  }

  private save(): Observable<void> {
    const base64 = this.profilePictureSrc?.length
      ? this.fileHelper.dataUrlToBase64(this.profilePictureSrc)
      : null;
    const thumbBase64 = this.profilePictureThumbnailSrc?.length
      ? this.fileHelper.dataUrlToBase64(this.profilePictureThumbnailSrc)
      : null;

    return this.profilePictureService
      .updateProfilePicture({
        profilePictureBase64: base64,
        profilePictureThumbnailBase64: thumbBase64,
      })
      .pipe(
        map(() => {
          this.msgService.success(
            "TenantManagement::ProfilePictureSettings:SaveSuccess"
          );

          this.storageService.resetCache(
            "TenantManagement;" +
              this.config.getAppConfig().currentUser.id +
              "-fullAvatar"
          );

          this.storageService.resetCache(
            "TenantManagement;" +
              this.config.getAppConfig().currentUser.id +
              "-avatar"
          );

          this.currentUserProfilePictureService.reload(
            this.config.getAppConfig().currentUser.id
          );
        })
      );
  }

  private setProfilePictureSrc(profilePicture: string): void {
    if (!profilePicture?.length) {
      return;
    }
    
    this.profilePictureSrc = this.fileHelper.base64ToDataURL(
      "application/image",
      profilePicture
    );
  }
}
