import { ILifecycleService, ILocalizationService, IPermissionService, StateActorTemplateDto, StatesGroupTemplateDto, StateTemplateDto } from '@eleon/angular-sdk.lib';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { StateActorTemplateSelectionDialogComponent } from './../state-actor-template-selection/state-actor-template-selection-dialog';
import { StateActorTypeOption,StateActorTypesService } from './../state-actor-template-selection';
import { MessageService } from 'primeng/api';

@Component({
  standalone: false,
  selector: 'app-lifecycle-state-actors-templates-management',
  templateUrl: './lifecycle-state-actors-templates-management.component.html',
  styleUrls: ['./lifecycle-state-actors-templates-management.component.scss'],
})
export class LifecycleStateActorsTemplatesManagementComponent implements OnInit {
  @ViewChild('approverAddDialog') approverAddDialog: StateActorTemplateSelectionDialogComponent;
  @ViewChild('reviewerAddDialog') reviewerAddDialog: StateActorTemplateSelectionDialogComponent;

  activeTabIndex: number = 0;

  approversOptions: StateActorTypeOption[] = [];
  reviewersOptions: StateActorTypeOption[] = [];

  reviewers: StateActorTemplateDto[] = [];
  approvers: StateActorTemplateDto[] = [];

  reviewersLoading: boolean = false;
  approversLoading: boolean = false;

  showApproverDialog: boolean = false;
  showReviewerDialog: boolean = false;

  @Input()
  documentObjectType: string;
  @Input()
  statesGroup: StatesGroupTemplateDto;
  @Input()
  state: StateTemplateDto;

	isLifecycleManager(){
		return true; // TODO: add permissions check  this.permissionService.getGrantedPolicy('LifecycleFeatureModule.LifecycleManager');
	}

  constructor(
    public localizationService: ILocalizationService,
    public messageService: MessageService,
    public lifecycleService: ILifecycleService,
    public stateActorTypesService: StateActorTypesService,
		private permissionService: IPermissionService
  ) {}

  ngOnInit(): void {
    //this.approversOptions = this.stateActorTypesService.getTypesForView();
    this.reviewersOptions = this.stateActorTypesService.getSelectionTypes();
    return;
  }

  loadStateActors() {
    this.approversLoading = true;
    this.reviewersLoading = true;
    if (!this.state?.id) {
      return;
    }
    this.lifecycleService.getAllStateActorTemplates(this.state.id).subscribe(stateActors => {
      this.approvers = stateActors.filter(sa => sa.isApprovalNeeded);
      this.approvers.sort((a, b) => a.orderIndex - b.orderIndex);
      this.approversLoading = false;
      this.reviewers = stateActors.filter(sa => !sa.isApprovalNeeded);
      this.reviewersLoading = false;
      this.reviewers.sort((a, b) => a.orderIndex - b.orderIndex);
    });
    return;
  }

  public addActor(): void {
    if (this.activeTabIndex === 0) {
      this.showApproverDialog = true;
    } else if (this.activeTabIndex === 1) {
      this.showReviewerDialog = true;
    }
  }

  enable(stateActor: StateActorTemplateDto) {
    this.lifecycleService
      .enableStateActorTemplate({
        newState: stateActor.isActive,
        id: stateActor.id,
      })
      .subscribe(_ => this.loadStateActors());
  }

  add(event: StateActorTemplateDto) {
    if (this.approvers.length) {
      event.orderIndex = this.approvers[this.approvers.length - 1].orderIndex + 1;
    } else {
      event.orderIndex = 0;
    }
    this.lifecycleService.addByStateActorTemplate(event).subscribe(result => {
      if (!result) {
        this.error('Lifecycle::States:Actors:Error');
        return;
      }

      this.success('Lifecycle::States:Actors:Added');
      this.loadStateActors();
    });
  }

  reorder() {
    const dict: Record<string, number> = {};
    this.approvers.forEach((actor, index) => (dict[actor.id] = index));
    this.lifecycleService
      .updateStateActorTemplateOrderIndexes(dict)
      .subscribe(_ => this.loadStateActors());
  }

  reorderReviewers() {
    const dict: Record<string, number> = {};
    this.reviewers.forEach((actor, index) => (dict[actor.id] = index));
    this.lifecycleService
      .updateStateActorTemplateOrderIndexes(dict)
      .subscribe(_ => this.loadStateActors());
  }

  remove(event: StateActorTemplateDto) {
    this.lifecycleService.removeStateActorTemplateById(event.id).subscribe(result => {
      if (!result) {
        this.error('Lifecycle::States:Actors:Error');
        return;
      }
      this.success('Lifecycle::States:Actors:Removed');
      this.loadStateActors();
    });
  }

  edit(event) {
    this.lifecycleService.updateByStateActorTemplate(event).subscribe(result => {
      if (!result) {
        this.error('Lifecycle::States:Actors:Error');
        return;
      }
      this.success('Lifecycle::States:Actors:Updated');
      this.loadStateActors();
    });
  }

  recognizeActorType(type){
    return this.stateActorTypesService.recognizeActorType(type);
  }

  success(msg){
    this.messageService.add({severity: 'success', summary: this.localizationService.instant(msg) });
  }

  error(msg){
    this.messageService.add({severity: 'error', summary: this.localizationService.instant(msg) });
  }
}
