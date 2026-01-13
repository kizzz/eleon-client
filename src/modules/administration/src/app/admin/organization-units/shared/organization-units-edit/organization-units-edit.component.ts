import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrganizationUnitService } from '@eleon/tenant-management-proxy';
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy';
import { ConfirmationService, MessageService } from 'primeng/api';
import { first } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-organization-units-edit',
  templateUrl: './organization-units-edit.component.html',
  styleUrls: ['./organization-units-edit.component.scss']
})
export class OrganizationUnitsEditComponent {
  @Input()
  display: boolean;
  @Input()
  orgUnitName: string;
  @Input()
  isEnabled: boolean;
  nameEmpty: boolean = false;
  @Input()
  selectedUnit: CommonOrganizationUnitDto;

  @Output()
  saveEvent = new EventEmitter<CommonOrganizationUnitDto>();

  @Output()
  closeEvent = new EventEmitter<void>();

  constructor(
    public organizationUnitService: OrganizationUnitService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localizationService: ILocalizationService,
  ) {}

  update() {
    if(!this.orgUnitName){
      this.nameEmpty = true;
      this.messageService.add({
        summary: this.localizationService.instant(('Infrastructure::OrgUnitNameEmpty')),
        severity: 'error'
      });
      return;
    }
    this.confirmationService.confirm({
      message: this.localizationService.instant("Infrastructure::EditOrgUnitWarning"),
      accept: () =>{
        this.organizationUnitService.update({
          ...this.selectedUnit,
          isEnabled: this.isEnabled,
          displayName: this.orgUnitName,
        })
        .pipe(first())
          .subscribe(result => {
            this.saveEvent.emit(result)
          })
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

  resetNameValidator(){
    this.nameEmpty = false;
  }

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }
}
