import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrganizationUnitService } from '@eleon/tenant-management-proxy';
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy';
import { first } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-organization-units-create',
  templateUrl: './organization-units-create.component.html',
  styleUrls: ['./organization-units-create.component.scss']
})
export class OrganizationUnitsCreateComponent {
  @Input()
  display: boolean;

  orgUnitName: string;
  currencySymbol: string;
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
    private organizationUnitService: OrganizationUnitService,
    private messageService: MessageService,
    private localizationService: ILocalizationService
  ) {
  }

  create() {
    if(!this.orgUnitName){
      this.nameEmpty = true;
      this.messageService.add({
        severity: "error",
        summary: this.localizationService.instant('Infrastructure::OrgUnitNameEmpty'),
      });
      return;
    }

    if(!this.currencySymbol){
      this.messageService.add({
        severity: "error",
        summary: this.localizationService.instant('Infrastructure::CurrencyEmpty'),
      });
      return;
    }
    if (!!this.parentChildrenOrgUnits?.length && !!this.parentChildrenOrgUnits.find(o => o.displayName == this.orgUnitName)) {
      this.messageService.add({
        severity: "error",
        summary: this.localizationService.instant('Infrastructure::OrgUnitExists'),
      });
      return;
    }

    this.organizationUnitService.create({
      parentId: this.parentOrgUnit?.id,
      code: this.currencySymbol,
      displayName: this.orgUnitName,
      isEnabled: true,
    })
    .pipe(first())
      .subscribe(result => {
        if(result){
          this.messageService.add({
            severity: "success",
            summary: this.localizationService.instant('Infrastructure::AddCompany:Success'),
          });
        }
        this.saveEvent.emit(result)
      });

    // PROBLEM
    // this.organizationUnitPermissionService.createCompanyOrgUnitByNewCompanyOrgUnitDtoAndParentId({
    //   organizationUnitName: this.orgUnitName,
    //   isLocal: true,
    //   isTransferred: false,
    //   isEnabled: true,
    //   localCurrencyCode: this.currencySymbol,
    //   systemCurrencyCode: this.currencySymbol,
    //   entityName: this.orgUnitName,
    // }, this.parentOrgUnit?.id,)
    // .pipe(first())
    //   .subscribe(result => {
    //     if(result){
    //       this.messageService.add({
    //         severity: "success",
    //         summary: this.localizationService.instant('Infrastructure::AddCompany:Success'),
    //       });
    //     }
    //     this.saveEvent.emit(result)
    //   });
  }

  resetNameValidator(){
    this.nameEmpty = false;
  }
}
