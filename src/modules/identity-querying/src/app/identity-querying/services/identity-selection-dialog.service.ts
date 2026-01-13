import { Injectable } from '@angular/core'
import { IIdentitySelectionDialogService, ILocalizationService, OrganizationUnitSelectionDialogConfig, OrganizationUnitSelectionEvent, RoleSelectionDialogConfig, TenantSelectionDialogConfig, UserSelectionDialogConfig } from '@eleon/angular-sdk.lib'
import { DialogService } from 'primeng/dynamicdialog';
import { UserSelectionBoxComponent } from '../selections/user-selection/user-table-box/user-table-box.component';
import { TenantSelectionBoxComponent } from '../selections/tenant-selection/tenant-table-box/tenant-table-box.component';
import { RoleSelectionBoxComponent } from '../selections/role-selection/role-table-box/role-table-box.component';
import { OrganizationUnitsSelectionTreeComponent } from '../selections/organization-units-selection/organization-units-selection-tree/organization-units-selection-tree.component';

@Injectable({
  providedIn: 'root'
})
export class IdentitySelectionDialogService extends IIdentitySelectionDialogService {
  constructor(private dialogService: DialogService, private localizationService: ILocalizationService) {
    super();
  }

  override openUserSelectionDialog(config: UserSelectionDialogConfig): void {
    const ref = this.dialogService.open(UserSelectionBoxComponent, {
      header: "[ QUERYING ] " +  (config.title || this.localizationService.instant('Infrastructure::UserSelection')),
      width: '600px',
      data: {
        permissions: config.permissions,
        selectedUsers: config.selectedUsers,
        ignoredUsers: config.ignoredUsers,
        isMultiple: config.isMultiple,
        onSelect: (data) => {
          if (config.onSelect && typeof config.onSelect === 'function') {
            config.onSelect(data);
          }

          ref.close();
        }
      },
    });
  }

  override openTenantSelectionDialog(config: TenantSelectionDialogConfig): void {
    const ref = this.dialogService.open(TenantSelectionBoxComponent, {
      header: "[ QUERYING ] " + (config.title || this.localizationService.instant('Infrastructure::TenantSelection')),
      width: '600px',
      data: {
        selectedTenants: config.selectedTenants,
        ignoredTenants: config.ignoredTenants,
        isMultiple: config.isMultiple,
        onSelect: (data) => {
          if (config.onSelect && typeof config.onSelect === 'function') {
            config.onSelect(data);
          }

          ref.close();
        }
      },
    });
  }

  override openRoleSelectionDialog(config: RoleSelectionDialogConfig): void {
    if (!config) {
      console.error('RoleService: openRoleSelectionDialog called with invalid config');
      return;
    }

    const ref = this.dialogService.open(RoleSelectionBoxComponent, {
      header: "[ QUERYING ] " + (config.title || this.localizationService.instant('Infrastructure::RoleSelection')),
      width: '440px',
      data: {
        permissions: config.permissions,
        selectedRoles: config.selectedRoles,
        ignoredRoles: config.ignoredRoles,
        isMultiple: config.isMultiple,
        onSelect: (data) => {
          if (config.onSelect && typeof config.onSelect === 'function') {
            config.onSelect(data);
          }

          ref.close();
        }
      },
    });
  }

  override openOrganizationUnitSelectionDialog(config: OrganizationUnitSelectionDialogConfig): void {
    const ref = this.dialogService.open(OrganizationUnitsSelectionTreeComponent, {
      header: "[ QUERYING ] " +  (config.title || this.localizationService.instant('Infrastructure::OrganizationUnitSelection')),
      width: '600px',
      data: {
        onlyUsers: config.onlyUsers,
        defaultSelectedOrganizationUnits: config.defaultSelectedOrganizationUnits,
        isFlat: config.isFlat,
        getWithUsers: config.getWithUsers,
        getForUserId: config.getForUserId,
        companyFilter: config.companyFilter,
        isMove: config.isMove,
        isManage: config.isManage,
        blocklist: config.blocklist,
        isOnlySingleSelectionMode: config.isOnlySingleSelectionMode,
        isShowSearch: config.isShowSearch,
        selectionMode: config.selectionMode,
        disableCheckBoxSelection: config.disableCheckBoxSelection,
        maxHeight: config.maxHeight,
        selectedOrgUnit: config.selectedOrgUnit,

        onSelect: (data: OrganizationUnitSelectionEvent) => {
          if (!data.selectionFinished && config.selectionMode != 'single') {
            return;
          }

          if (config.onSelect && typeof config.onSelect === 'function') {
            config.onSelect(data);
          }

          ref.close();
        }
      },
    });
  }
}