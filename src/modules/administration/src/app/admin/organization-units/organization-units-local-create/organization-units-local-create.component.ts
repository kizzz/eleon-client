import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrganizationUnitService } from '@eleon/tenant-management-proxy';
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy';
import { ConfirmationService, MessageService } from 'primeng/api';
import { first } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-organization-units-local-create',
  templateUrl: './organization-units-local-create.component.html',
  styleUrls: ['./organization-units-local-create.component.scss']
})
export class OrganizationUnitsLocalCreateComponent {

  @Input()
  display: boolean;

  orgUnitName: string;
  nameEmpty: boolean = false;
  @Input()
  parentOrgUnit: CommonOrganizationUnitDto;
  @Input()
  parentChildrenOrgUnits: CommonOrganizationUnitDto[]; 

  @Output()
  saveEvent = new EventEmitter<CommonOrganizationUnitDto>();

  @Output()
  closeEvent = new EventEmitter<void>();

  constructor(
    public organizationUnitService: OrganizationUnitService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localizationService: ILocalizationService,
  ) {

  }

  create() {
    if(!this.orgUnitName){
      this.nameEmpty = true;
      this.messageService.add({
        summary: this.localizationService.instant(('Infrastructure::OrgUnitNameEmpty')),
        severity: 'error'
      });
      return;
    }
    if (!!this.parentChildrenOrgUnits?.length && !!this.parentChildrenOrgUnits.find(o => o.displayName == this.orgUnitName)) {
      this.messageService.add({
        summary: this.localizationService.instant(('Infrastructure::OrgUnitExists')),
        severity: 'error'
      });
      return;
    }

    this.organizationUnitService.create({
      isEnabled: true,
      displayName: this.orgUnitName,
      parentId: this.parentOrgUnit?.id,
    })
    .pipe(first())
      .subscribe(result => {
        this.saveEvent.emit(result)
      });
  }

  resetNameValidator(){
    this.nameEmpty = false;
  }
}
