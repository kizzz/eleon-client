import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-organization-units-move',
  templateUrl: './organization-units-move.component.html',
  styleUrls: ['./organization-units-move.component.scss']
})
export class OrganizationUnitsMoveComponent {
  
  @Input()
  display: boolean = false;
  @Output()
  displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input()
  selectedOrgUnit: CommonOrganizationUnitDto; 
  width = '50rem';
  title: string = '';

  @Output()
  closeEvent = new EventEmitter<void>();
  @Output()
  moveEvent = new EventEmitter<{
    orgUnitId: string,
    parentId: string
  }>();

  @Input()
  isMove: boolean; 

  constructor(
    public localizationService: ILocalizationService
    ){ 
      this.title=this.localizationService.instant('Infrastructure::OrganizationUnit:MoveTo');
    }

  onSelect(event: { selectedOrgUnit: CommonOrganizationUnitDto }) {
    this.moveEvent.emit({
      orgUnitId: this.selectedOrgUnit.id,
      parentId: event.selectedOrgUnit?.id,
    })
  }
}
