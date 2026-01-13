import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FileArchivePermissionService } from '@eleon/file-manager-proxy';
import { FileArchivePermissionDto } from '@eleon/file-manager-proxy';
import { FileManagerPermissionType, PermissionActorType, fileManagerPermissionTypeOptions, permissionActorTypeOptions } from '@eleon/file-manager-proxy';
import { ConfirmationService } from 'primeng/api';
import { Observable, finalize, map, tap } from 'rxjs';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { TableRowEditorDirective } from '@eleon/primeng-ui.lib';
import { ValidationRuleSet } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-permission-management-table',
  templateUrl: './permission-management-table.component.html',
  styleUrls: ['./permission-management-table.component.scss']
})
export class PermissionManagementTableComponent implements OnInit {

  @Input()
  header;

  @ViewChild(TableRowEditorDirective) tableRowEditorDirective : TableRowEditorDirective;

  @Input()
  archiveId: string;

  @Input()
  folderId: string;

  @Input()
  actorType: PermissionActorType;

  @Input()
  newActorId: string;

  @Input()
  newActorDisplayName: string;

  @Input()
  permissions: FileArchivePermissionDto[] = [];

  @Input()
  loading: boolean;

  readPermissionType = FileManagerPermissionType.Read; 

  fileManagerPermissionTypes = [
    FileManagerPermissionType.Read,
    FileManagerPermissionType.Write,
    FileManagerPermissionType.Modify,
  ];

  fileManagerPermissionLocalizedTypes = fileManagerPermissionTypeOptions;

  @Input()
  defaultPermissions: FileArchivePermissionDto[] = [];

  searchQueryText:string = null;

  @Output()
  reloadEvent = new EventEmitter<string>();

  constructor(
    public fileArchivePermissionService: FileArchivePermissionService,
    public confirmationService: LocalizedConfirmationService,
    public localizationService: ILocalizationService
  ) {

  }
  ngOnInit(): void {
  }

  public add(actorName: string, actorId: string) {
    this.newActorDisplayName = actorName;
    this.newActorId = actorId;
    this.tableRowEditorDirective.startAdding();
  }

  public checkPermission(row: FileArchivePermissionDto, type: FileManagerPermissionType)
    : boolean {
    return !!row.allowedPermissions.find(a => a == type);
  }

  public togglePermission(checked: boolean, row: FileArchivePermissionDto, type: FileManagerPermissionType) {
    const permission = row.allowedPermissions.find(a => a == type);
    if (!permission && checked) {
      row.allowedPermissions = [...row.allowedPermissions, type];
    }
    else if (!checked) {
      if (type == FileManagerPermissionType.Read) {
        row.allowedPermissions = [];
      }
      else {
        row.allowedPermissions = row.allowedPermissions.filter(t => t != type);
      }
    }
  }

  public permissionRowFactory = (
    permission?: FileArchivePermissionDto 
  ): FileArchivePermissionDto => {
    return {
      archiveId: this.archiveId,
      folderId: this.folderId,
      allowedPermissions: [],
      actorType: this.actorType,
      actorId: this.newActorId,
      actorDisplayName: this.newActorDisplayName,
      uniqueKey: this.getRowUniqueId()
    };
  };

  getRowUniqueId(): string {
    let max = 0;
    for (let item of this.permissions) {
      let uniqueKeyNumber = parseInt(item.uniqueKey, 10);
      if (uniqueKeyNumber > max) {
        max = uniqueKeyNumber;
      }
    }
    return (max + 1).toString();
  }

  public addPermission = (permission: FileArchivePermissionDto): Observable<boolean> => {
    this.loading = true;
    return this.fileArchivePermissionService
      .updatePermissionByUpdatedPermissionDto(
        permission
      )
      .pipe(map(v => !!v))
      .pipe(finalize(() => (this.loading = false)))
      // .pipe(tap(() => this));
  }
  public editPermission = (permission: FileArchivePermissionDto): Observable<boolean> => {
    this.loading = true;
    return this.fileArchivePermissionService
      .updatePermissionByUpdatedPermissionDto(
        permission
      )
      .pipe(map(v => !!v))
      .pipe(finalize(() => (this.loading = false)))
      // .pipe(tap(() => this));
  }

  updateDefault(checked, permission, type) {
    this.togglePermission(checked, permission, type);
    this.editPermission(permission).subscribe(result => {
      
    })
  }

  public getKey(data: FileArchivePermissionDto) {
    return data.actorType + data.actorId;
  }

  public permissionChanged(permissions) {
  }

  public onRowRemove = (row: FileArchivePermissionDto): Observable<boolean> => {
    return new Observable<boolean>((observer) => {
        this.confirmationService.confirm(
            "FileManager::RemovePermissionConfirmation",
            () => {
                this.loading = true;
                this.fileArchivePermissionService.deletePermissionsByDeletedPermissionDto(row)
                    .pipe(finalize(() => {
                        this.loading = false;
                        observer.next(true);
                        observer.complete();
                    }))
                    .subscribe(
                        () => {},
                        (error) => {
                            this.loading = false;
                            observer.next(false);
                            observer.complete();
                        }
                    );
            }
        );
    });
};

  search(event) {
    this.reloadEvent.emit(this.searchQueryText);
  }

  clear(event) {
    this.searchQueryText = "";
    this.search(event);
  }
}
