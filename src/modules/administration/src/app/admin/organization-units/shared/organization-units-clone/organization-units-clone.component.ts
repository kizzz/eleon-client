import { Component, EventEmitter, Input, Output } from '@angular/core';

import { OrganizationUnitService } from '@eleon/tenant-management-proxy'
import { CommonOrganizationUnitTreeNodeDto } from '@eleon/tenant-management-proxy'
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy'
import { ConfirmationService, MessageService } from 'primeng/api';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
export interface CloneEvent {
  cloneRoles: boolean;
  cloneMembers: boolean;
  cloneName: string;
  originalOrgUnitId: string;
}

@Component({
  standalone: false,
  selector: 'app-organization-units-clone',
  templateUrl: './organization-units-clone.component.html',
  styleUrls: ['./organization-units-clone.component.scss']
})
export class OrganizationUnitsCloneComponent {
  @Input()
  display: boolean;

  cloneName: string;
  nameEmpty: boolean = false;
  cloneRoles: boolean;
  cloneMembers: boolean;
  cloneChildren: boolean;

  @Input()
  selectedOrgUnit: CommonOrganizationUnitDto;
  @Input()
  parentChildrenOrgUnits: CommonOrganizationUnitDto[]; 

  @Output()
  cloneEvent = new EventEmitter<CommonOrganizationUnitTreeNodeDto>();

  @Output()
  closeEvent = new EventEmitter<void>();

  constructor(
    public organizationUnitService: OrganizationUnitService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localizationService: ILocalizationService,
  ) {
  }

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }
  
  resetNameValidator(){
    this.nameEmpty = false;
  }

  clone() {
    if(!this.cloneName){
      this.nameEmpty = true;
      this.messageService.add({
        summary: this.localizationService.instant(('Infrastructure::OrgUnitNameEmpty')),
        severity: 'error'
      });
      return;
    }
    if (!!this.parentChildrenOrgUnits?.length && !!this.parentChildrenOrgUnits.find(o => o.displayName == this.cloneName)) {
      this.messageService.add({
        summary: this.localizationService.instant(('Infrastructure::OrgUnitExists')),
        severity: 'error'
      });
      return;
    }

    this.confirmationService.confirm({
      message: this.localizationService.instant('Infrastructure::CloneOrgUnitWarning'),
      accept: () =>{
        this.organizationUnitService.cloneByIdAndNewNameAndWithRolesAndWithMembersAndWithChildren(this.selectedOrgUnit.id,
          this.cloneName, this.cloneRoles, this.cloneMembers, this.cloneChildren)
          .subscribe(result => {
            this.cloneEvent.emit(result)})
      },
      reject: () =>{
        return;
      },
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    }
    );
  }
}
