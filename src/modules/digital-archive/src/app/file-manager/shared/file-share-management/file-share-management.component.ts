import { FileManagerDetailsService } from '../../core/services/file-manager-details.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FileExternalLinkService } from '@eleon/file-manager-proxy';
import { FileExternalLinkDto, FileExternalLinkReviewerDto } from '@eleon/file-manager-proxy';
import { ExternalLinkLoginType, FileShareStatus, LinkShareStatus, fileShareStatusOptions, linkShareStatusOptions } from '@eleon/file-manager-proxy';
import { FileReviewerType, fileReviewerTypeOptions } from '@eleon/file-manager-proxy';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, finalize, first, from, map, of, tap } from 'rxjs';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { TableRowEditorDirective } from '@eleon/primeng-ui.lib';
import { fileShareIcons } from '../file-share-icons';
import { TableAction } from '@eleon/primeng-ui.lib';
import { fileReviewerSeverities } from '../file-reviewer-severities';

import { FileManagerViewSettingsService } from '../../core/services/file-manager-view-settings.service';

import { IIdentitySelectionDialogService, ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: 'app-file-share-management',
  templateUrl: './file-share-management.component.html',
  styleUrls: ['./file-share-management.component.scss']
})
export class FileShareManagementComponent implements OnInit {

  @ViewChild(TableRowEditorDirective)
  tableRowEditorDirective;

  setting: FileExternalLinkDto;

  newPermissionType: FileShareStatus = FileShareStatus.None;

  loading: boolean = false;

  reviewerStatusOptions = linkShareStatusOptions;
  fileReviewerSeverities = fileReviewerSeverities;

  options = fileShareStatusOptions.filter(t => t.value != FileShareStatus.None);
  fileShareIcons = fileShareIcons;
  FileShareStatus = FileShareStatus;
  reviewerOptions = fileReviewerTypeOptions.map(r => ({
    key: this.localizationService.instant('FileManager::ReviewerType:'+ r.key),
    value: r.value,
  }));
  reviewerType = FileReviewerType;
  reviewerStatus = LinkShareStatus;

  constructor(
    private identitySelectionService: IIdentitySelectionDialogService,
    public fileExternalLinkService: FileExternalLinkService,
    public fileManagerViewSettingsService: FileManagerViewSettingsService,
    public dialogRef: DynamicDialogRef,
    public confirmationService: LocalizedConfirmationService,
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    public config: DynamicDialogConfig<{
      archiveId: string,
      fileId: string,
    }>
  ) {
  }
  ngOnInit(): void {
    this.load();
  }

  load() {
    this.fileExternalLinkService.getFileExternalLinkSettingByFileIdAndArchiveId(this.config.data.fileId, this.config.data.archiveId)
      .subscribe(result => {
        this.setting = result;
        this.newPermissionType = this.setting.permissionType;
        if (this.setting.permissionType == FileShareStatus.None) {
          
        }
      })
  }

  getUrl(reviewer: FileExternalLinkReviewerDto) {
    if (reviewer.externalLink) {
      return reviewer.externalLink.fullLink;
    }

    return document.location.protocol +'//'+ document.location.hostname + '/ui/digital-archive/internal/' + reviewer.id;
  }

  getReviewerTypeName(reviewerType: FileReviewerType) {
    return this.reviewerOptions.find(o => o.value == reviewerType)?.key;
  }

  public reviewerRowFactory = (
    reviewer?: FileExternalLinkReviewerDto 
  ): FileExternalLinkReviewerDto => {
    const month = 30 * 24 * 60 * 60 * 1000;
    let date = new Date(new Date().getTime() + month * 2);
    return {
      reviewerType: FileReviewerType.User,
      reviewerKey: null,
      expirationDateTime: date.toJSON(),
      lastReviewDates: new Date().toJSON(),
      reviewerStatus: LinkShareStatus.Active,
      externalLink: null,
      reviewerKeyLabel: ""
    };
  };

  public rowRemoved: TableAction<FileExternalLinkReviewerDto> = (reviewer: FileExternalLinkReviewerDto) : Observable<boolean> => {
    return from(this.deleteReviewer(reviewer.id));
    
  }

  public addReviewer = (reviewer: FileExternalLinkReviewerDto): Observable<boolean> => {
    return !reviewer.reviewerKey ? of(false)
      .pipe(tap(t => this.messageService.error('FileManager::Reviewer:NotSelected')))
    :
      this.fileExternalLinkService.createOrUpdateReviewerByCreateOrUpdateReviewerDto
      ({
        fileExternalLinkId: this.setting.id,
        updatedReviewer: {...reviewer, id: undefined},
        externalLink: reviewer.externalLink
      })
      .pipe(map(r => {
        reviewer.id = r.id;
        reviewer.reviewerKeyLabel = r.reviewerKeyLabel;
        return !!r.id;
      }))
      // .pipe(tap(() => this));
  }
  public editReviewer = (reviewer: FileExternalLinkReviewerDto): Observable<boolean> => {
    return !reviewer.reviewerKey ? of(false)
    .pipe(tap(t => this.messageService.error('FileManager::Reviewer:NotSelected')))
    : 
    this.fileExternalLinkService.createOrUpdateReviewerByCreateOrUpdateReviewerDto
    ({
      fileExternalLinkId: this.setting.id,
      updatedReviewer: reviewer,
      externalLink: reviewer.externalLink,
    })
    .pipe(map(r => {
      reviewer.reviewerKeyLabel = r.reviewerKeyLabel;
      return !!r.id;
    }));
  }

  public add() {
    this.tableRowEditorDirective.startAdding();
  }

  public getKey(data: FileExternalLinkReviewerDto) {
    return data.id + data.reviewerType + data.reviewerKey  + data.expirationDateTime;
  }

  public permissionChanged(permissions) {
  }

  public share() {
    this.loading = true;
    this.fileExternalLinkService.updateExternalLinkSettingByUpdatedDto({...this.setting, permissionType: this.newPermissionType})
      .pipe(first())
      .subscribe(result => {
        this.loading = false;
        this.messageService.success("FileManager::Share:Success");
        this.setting = result;
        this.fileManagerViewSettingsService.reloadCurrentFolder();
      })
  }

  cancel() {
    this.confirmationService.confirm('FileManager::Share:Cancel:AreYouSure', 
    () => {
      this.loading = true;
      this.fileExternalLinkService
        .cancelChangesByLinkId(this.setting.id)
        .pipe(first())
        .subscribe(result => {
          this.loading = false;
          this.fileManagerViewSettingsService.reloadCurrentFolder();
          this.messageService.success('FileManager::Share:Cancel:Success');
          this.dialogRef.close();
        })});
  }
  save() {
    this.confirmationService.confirm('FileManager::Share:Save:AreYouSure', () => this.saveChanges(false));
  }

  saveChanges(cancelAfterSave: boolean) {
    this.loading = true;
    this.fileExternalLinkService.saveChangesByLinkIdAndDeleteAfterChanges(this.setting.id,
      cancelAfterSave)
      .pipe(first())
      .subscribe(result => {
        this.loading = false;
        this.messageService.success('FileManager::Share:Save:Success');
        this.fileManagerViewSettingsService.reloadCurrentFolder();
        this.dialogRef.close();
      })
  }

  confirmSharePermissionChanges(newShareStatus: FileShareStatus) {
    if (this.setting.permissionType == FileShareStatus.None) {
      return;
    }
    this.confirmationService.confirm('FileManager::Share:Change:AreYouSure', () => {
      this.share();
    }, () => {
      this.newPermissionType = this.setting.permissionType;

    });
  }

  deleteReviewer(id: string) : Promise<boolean> {
    return new Promise(resolve => {
      this.confirmationService.confirm('FileManager::Share:Reviewer:Delete:AreYouSure',
      () => this.fileExternalLinkService.deleteReviewerByReviewerId(id)
        .pipe(first())
        .subscribe(result => {
          this.messageService.success('FileManager::Share:Reviewer:Delete:Success');
          this.load();
          resolve(true);
        })),
        () => resolve(false)
    })
  }
  copiedToClipboard() {
    this.messageService.success('FileManager::Share:Copy:Success')
  }
  enableReviewer(reviewer : FileExternalLinkReviewerDto) {
    reviewer.reviewerStatus = LinkShareStatus.Active;
    this.loading = true;
    this.fileExternalLinkService.createOrUpdateReviewerByCreateOrUpdateReviewerDto
    ({
      fileExternalLinkId: this.setting.id,
      updatedReviewer: reviewer,
      externalLink: reviewer.externalLink,
    })
    .pipe(map(r => {
      reviewer.reviewerStatus = r.reviewerStatus;
      return !!r.id;
    })).subscribe(result => {
      this.loading = false;
    })
    
    ;
  }
  disableReviewer(reviewer : FileExternalLinkReviewerDto) {
    reviewer.reviewerStatus = LinkShareStatus.Canceled;
    this.loading = true;
    this.fileExternalLinkService.createOrUpdateReviewerByCreateOrUpdateReviewerDto
    ({
      fileExternalLinkId: this.setting.id,
      externalLink: reviewer.externalLink,
      updatedReviewer: reviewer,
    })
    .pipe(map(r => {
      reviewer.reviewerStatus = r.reviewerStatus;
      return !!r.id;
    })).subscribe(result => {
      this.loading = false;
    })
    
    ;
  }

  getReviewerLabel(reviewer: FileExternalLinkReviewerDto) {
    if ([this.reviewerType.User, this.reviewerType.OrganizationUnit, this.reviewerType.Role]
      .includes(reviewer.reviewerType)) {
      return reviewer.reviewerKeyLabel;
    }

    if (!reviewer.externalLink) {
      return '';
    }

    const prefix = {
      [ExternalLinkLoginType.None]: this.localizationService.instant('FileManager::ExternalAnonymous'),
      [ExternalLinkLoginType.Email]: this.localizationService.instant('FileManager::ExternalPrivate:Email'),
      [ExternalLinkLoginType.Sms]: this.localizationService.instant('FileManager::ExternalPrivate:Sms'),
      [ExternalLinkLoginType.Password]: this.localizationService.instant('FileManager::ExternalPrivate:Password'),
    }[reviewer.externalLink?.loginType];

    return `${reviewer.reviewerKey}`
  }

  isExpired(reviewer: FileExternalLinkReviewerDto) {
    return new Date(reviewer.expirationDateTime).getTime() < Date.now();
  }
  
  close() {
    this.dialogRef.close();
  }

  showIdentitySelection(reviewer: FileExternalLinkReviewerDto) {
    switch(reviewer.reviewerType) {
      case FileReviewerType.User:
        this.identitySelectionService.openUserSelectionDialog({
          title: this.localizationService.instant('FileManager::Reviewer:User:Select'),
          permissions: [],
          selectedUsers: [],
          isMultiple: false,
          ignoredUsers: [],
          onSelect: (users) => {
            const user = users[0];
            if (user) {
              reviewer.reviewerKey = user.id; 
              reviewer.reviewerKeyLabel = user.name
            }
        }});
        break;
      case FileReviewerType.Role:
        this.identitySelectionService.openRoleSelectionDialog({
          title: this.localizationService.instant('FileManager::Reviewer:Role:Select'),
          permissions: [],
          selectedRoles: [],
          isMultiple: false,
          ignoredRoles: [],
          onSelect: (roles) => {
            const role = roles[0];
            if (role) {
              reviewer.reviewerKey = role.id; 
              reviewer.reviewerKeyLabel = role.name
            }
        }});
        break;
      case FileReviewerType.OrganizationUnit:
        this.identitySelectionService.openOrganizationUnitSelectionDialog({
          title: this.localizationService.instant('FileManager::Reviewer:OrganizationUnit:Select'),
          onlyUsers: false,
          onSelect: (units) => {
            const unit = units[0];
            if (unit) {
              reviewer.reviewerKey = unit.id; 
              reviewer.reviewerKeyLabel = unit.displayName
            }
        }});
        break;
    }
  }
}
