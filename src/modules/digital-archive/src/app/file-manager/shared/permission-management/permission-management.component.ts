import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FileArchivePermissionService } from '@eleon/file-manager-proxy';
import { FileArchivePermissionDto } from '@eleon/file-manager-proxy';
import { PermissionActorType } from '@eleon/file-manager-proxy';
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy';
import { CommonRoleDto } from '@eleon/tenant-management-proxy';
import { CommonUserDto } from '@eleon/tenant-management-proxy';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { first } from 'rxjs';
import {
  IIdentitySelectionDialogService,
  ILocalizationService,
} from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PermissionManagementTableComponent } from './permission-management-table/permission-management-table.component';

type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

@Component({
  standalone: false,
  selector: 'app-permission-management',
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.scss'],
})
export class PermissionManagementComponent implements OnInit {
  permissions: FileArchivePermissionDto[] = [];

  permissionDefaultGroups: EnumDictionary<
    PermissionActorType,
    FileArchivePermissionDto
  > = {
    [PermissionActorType.User]: {
      allowedPermissions: [],
      actorType: PermissionActorType.User,
      actorId: null,
      archiveId: this.config.data.archiveId,
      folderId: this.config.data.folderId,
    },
    [PermissionActorType.Role]: {
      allowedPermissions: [],
      actorType: PermissionActorType.Role,
      actorId: null,
      archiveId: this.config.data.archiveId,
      folderId: this.config.data.folderId,
    },
    [PermissionActorType.OrganizationUnit]: {
      allowedPermissions: [],
      actorType: PermissionActorType.OrganizationUnit,
      actorId: null,
      archiveId: this.config.data.archiveId,
      folderId: this.config.data.folderId,
    },
  };

  permissionGroups: EnumDictionary<
    PermissionActorType,
    FileArchivePermissionDto[]
  > = {
    [PermissionActorType.User]: [],
    [PermissionActorType.Role]: [],
    [PermissionActorType.OrganizationUnit]: [],
  };

  actorTypes = PermissionActorType;

  loading: boolean;

  userId: string;

  activeIndex: number = 0;

  protected selectedUser: CommonUserDto;
  protected selectedRole: CommonRoleDto;
  protected selectedOrgUnit: CommonOrganizationUnitDto;

  @ViewChild(PermissionManagementTableComponent)
  permissionTable: PermissionManagementTableComponent;
  searchQueryText: string = null;
  constructor(
    private localizationService: ILocalizationService,
    private identitySelectionService: IIdentitySelectionDialogService,
    public permissionService: FileArchivePermissionService,
    public config: DynamicDialogConfig<{
      archiveId: string;
      folderId: string;
    }>,
    public msgService: LocalizedMessageService
  ) {}
  ngOnInit(): void {
    this.loadPermissions();
  }

  getPermissions(actorType: PermissionActorType) {
    return this.permissions.filter(
      (p) => p.actorType == actorType && !!p.actorId
    );
  }

  getDefault(actorType: PermissionActorType) {
    return (
      this.permissions.find((p) => p.actorType == actorType && !p.actorId) ?? {
        allowedPermissions: [],
        actorType,
        actorId: null,
        archiveId: this.config.data.archiveId,
        folderId: this.config.data.folderId,
      }
    );
  }

  loadPermissions() {
    this.loading = true;
    this.permissionService
      .getListByArchiveIdAndFolderId(
        this.config.data.archiveId,
        this.config.data.folderId
      )
      .pipe(first())
      .subscribe((result) => {
        this.permissions = result;
        if (this.searchQueryText?.length > 0) {
          this.permissions = this.permissions.filter((permission) =>
            permission.actorDisplayName.includes(this.searchQueryText)
          );
        }
        this.permissionGroups = {
          [PermissionActorType.User]: this.getPermissions(
            PermissionActorType.User
          ),
          [PermissionActorType.Role]: this.getPermissions(
            PermissionActorType.Role
          ),
          [PermissionActorType.OrganizationUnit]: this.getPermissions(
            PermissionActorType.OrganizationUnit
          ),
        };
        this.permissionDefaultGroups = {
          [PermissionActorType.User]: this.getDefault(PermissionActorType.User),
          [PermissionActorType.Role]: this.getDefault(PermissionActorType.Role),
          [PermissionActorType.OrganizationUnit]: this.getDefault(
            PermissionActorType.OrganizationUnit
          ),
        };
        this.loading = false;
      });
  }

  reload(event: string) {
    this.searchQueryText = event;
    this.loadPermissions();
  }

  showRoleSelection(ur: PermissionManagementTableComponent) {
    if (this.permissionTable.tableRowEditorDirective.isEditingIsInProcess()) {
      this.msgService.error('Infrastructure::RowEditingInProcess');
      return;
    }
    this.identitySelectionService.openRoleSelectionDialog({
      title: this.localizationService.instant(
        'FileManager::PermissionManagement::SelectRole'
      ),
      permissions: [],
      selectedRoles: [],
      isMultiple: false,
      ignoredRoles: [],
      onSelect: (roles) => {
        const selectedRole = roles[0];
        if (selectedRole) {
          this.selectedRole = selectedRole;
          ur.add(selectedRole?.name, selectedRole?.id);
        }
      },
    });
  }

  showUserSelection(ur: PermissionManagementTableComponent) {
    if (this.permissionTable.tableRowEditorDirective.isEditingIsInProcess()) {
      this.msgService.error('Infrastructure::RowEditingInProcess');
      return;
    }
    this.identitySelectionService.openUserSelectionDialog({
      title: this.localizationService.instant(
        'FileManager::PermissionManagement::SelectRole'
      ),
      permissions: [],
      selectedUsers: [],
      isMultiple: false,
      ignoredUsers: [],
      onSelect: (users) => {
        const selectedUser = users[0];
        if (selectedUser) {
          this.selectedUser = selectedUser;
          ur.add(selectedUser.name, selectedUser.id);
        }
      },
    }); 
  }

  showOrgUnitSelection(ur: PermissionManagementTableComponent) {
    if (this.permissionTable.tableRowEditorDirective.isEditingIsInProcess()) {
      this.msgService.error('Infrastructure::RowEditingInProcess');
      return;
    }
    this.identitySelectionService.openOrganizationUnitSelectionDialog({
      title: this.localizationService.instant(
        'FileManager::PermissionManagement::SelectRole'
      ),
      selectionMode: "single",
      onlyUsers: false,
      isOnlySingleSelectionMode: true,
      onSelect: (orgUnitEvent) => {
        const selectedOrgUnit = orgUnitEvent.selectedOrgUnit;
        if (selectedOrgUnit) {
          this.selectedOrgUnit = selectedOrgUnit;
          ur.add(selectedOrgUnit.displayName, selectedOrgUnit.id);
        }
      },
    }); 
  }
}
