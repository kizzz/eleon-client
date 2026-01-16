import { state } from '@angular/animations';
import {
  ILocalizationService,
  StatesGroupTemplateDto,
} from '@eleon/angular-sdk.lib';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import {
  FullStatesGroupTemplateDto,
  StatesGroupTemplateService,
} from '@eleon/lifecycle-feature-proxy';

@Component({
  standalone: false,
  selector: 'app-lifecycle-states-groups-templates-management-details',
  templateUrl:
    './lifecycle-states-groups-templates-management-details.component.html',
  styleUrls: [
    './lifecycle-states-groups-templates-management-details.component.scss',
  ],
})
export class LifecycleStatesGroupsTemplatesManagementDetailsComponent
  implements OnInit, OnChanges
{
  loading: boolean = false;
  @Input()
  selectedStateGroup: StatesGroupTemplateDto;

  fullStatesGroupTemplate: FullStatesGroupTemplateDto;
  constructor(
    // private lifecycleOrgUnitsService: LifecycleOrganizationUnitService,
    private statesGroupTemplateService: StatesGroupTemplateService,
    private localizationService: ILocalizationService,
    private msgService: MessageService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedStateGroup'] &&
      !changes['selectedStateGroup'].isFirstChange()
    ) {
      this.loadFullStatesGroupTemplate();
    }
  }
  ngOnInit(): void {
    this.loadFullStatesGroupTemplate();
  }

  loadFullStatesGroupTemplate(): void {
    this.loading = true;
	if (!this.selectedStateGroup || !this.selectedStateGroup?.id) {
		this.fullStatesGroupTemplate = null;
		this.loading = false;
		return;
	}
    this.statesGroupTemplateService
      .get(this.selectedStateGroup.id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (group) => {
          this.fullStatesGroupTemplate = group;
        },
        error: (err) => {
          this.msgService.add({
            severity: 'error',
            summary: this.localizationService.instant(
              'Lifecycle::StatesGroup:LoadErrorTitle'
            ),
            detail: err.message,
          });
        },
      });
  }
}
