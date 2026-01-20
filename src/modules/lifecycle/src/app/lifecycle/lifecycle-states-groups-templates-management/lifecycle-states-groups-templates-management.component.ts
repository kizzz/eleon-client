import { Component, EventEmitter, Input, OnInit, Output, viewChild, ViewChild } from '@angular/core';
import { StatesGroupTemplateDto } from '@eleon/angular-sdk.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { LifecycleStatesGroupsTemplatesManagementDetailsComponent } from './lifecycle-states-groups-templates-management-details/lifecycle-states-groups-templates-management-details.component';

@Component({
  standalone: false,
  selector: 'app-lifecycle-states-groups-templates-management',
  templateUrl: './lifecycle-states-groups-templates-management.component.html',
  styleUrls: ['./lifecycle-states-groups-templates-management.component.scss']
})
export class LifecycleStatesGroupsTemplatesManagementComponent {
  @Input()
  documentObjectType: string;

  @Input()
  selectedStatesGroup: StatesGroupTemplateDto;

  @Output()
  groupEditEvent: EventEmitter<StatesGroupTemplateDto> = new EventEmitter<StatesGroupTemplateDto>();
  constructor(
    public pageStateService: PageStateService,
  ) { }

  select(event) {
    this.selectedStatesGroup = {...event};
  }
  saved(event) {
    this.selectedStatesGroup = {...event};
  }
  edit(event) {
    this.groupEditEvent.emit(event);
  }
}
