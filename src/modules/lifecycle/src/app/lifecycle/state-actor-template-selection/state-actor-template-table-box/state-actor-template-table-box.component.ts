import { IIdentitySelectionDialogService, ILocalizationService, LifecycleActorTypes, StateActorTemplateDto } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StateActorTypeOption } from '../state-actor-types-option';
import { StateActorTypesService } from '../state-actor-types.service';
import { CommonUserDto, CommonRoleDto } from '@eleon/tenant-management-proxy'
import { nameRegexp } from '@eleon/angular-sdk.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { MessageService } from 'primeng/api';

@Component({
  standalone: false,
  selector: 'app-state-actor-template-table-box',
  templateUrl: './state-actor-template-table-box.component.html',
  styleUrls: ['./state-actor-template-table-box.component.scss'],
})
export class StateActorTemplateSelectionBoxComponent implements OnInit {
  types: StateActorTypeOption[];

  inputName: string = "";
  formAdmin: boolean;
  approvalManager: boolean;
  approvalAdmin: boolean;

  selectedType: StateActorTypeOption;
  selectedUser: CommonUserDto;
  selectedRole: CommonRoleDto;
	selectedActiveState = true;

  // docTypes: DocumentTypeOption[];
  taskLists: Partial<Record<string, string>> = {};

  @Output()
  saveEvent: EventEmitter<StateActorTemplateDto> = new EventEmitter<StateActorTemplateDto>();

  @Input()
  documentObjectType: string;
  @Input()
  stateActor: StateActorTemplateDto = {} as StateActorTemplateDto;
  @Input()
  stateId: string;
  @Input()
  reviewer: boolean;

  typeEmpty: boolean = false;
  userEmpty: boolean = false;
  roleEmpty: boolean = false;

  constructor(
    public localizationService: ILocalizationService,
    public messageService: MessageService,
    public stateActorTypesService: StateActorTypesService,
    public pageStateService: PageStateService,
    private identityService: IIdentitySelectionDialogService
  ) {}

  ngOnInit(): void {
    this.load();

		this.enableOptions = [
			{ name: this.localizationService.instant('Infrastructure::Yes'), value: true },
			{ name: this.localizationService.instant('Infrastructure::No'), value: false }
		]
  }

	enableOptions = []

  load() {
    if (this.stateActor) {
      this.inputName = this.stateActor.actorName;
      this.formAdmin = this.stateActor.isFormAdmin;
      this.approvalManager = this.stateActor.isApprovalManager;
      this.approvalAdmin = this.stateActor.isApprovalAdmin;
			this.selectedActiveState = this.stateActor.isActive;
      this.taskLists = {};
      this.stateActor.taskLists.forEach(taskList => {
        this.taskLists = {
          ...this.taskLists,
          ...{
            [taskList.documentObjectType]: taskList.taskListId,
          },
        };
      });
      this.selectedType = this.stateActorTypesService.recognizeActorType([this.stateActor.actorType]);

      if (this.stateActor.actorType == LifecycleActorTypes.User) {
        this.selectedUser = {
          id: this.stateActor.refId,
          name: this.stateActor.displayName,
          roles: [],
          organizationUnits: [],
          isActive: true
        };
      }
      if (this.stateActor.actorType == LifecycleActorTypes.Role) {
        this.selectedRole = {
          id: this.stateActor.refId,
          name: this.stateActor.displayName,
          isReadOnly: true,
          isDefault: false,
          isPublic: false
        };
      }
    }
    if (this.reviewer) {
      this.types = this.stateActorTypesService.getSelectionTypes();
      return;
    }
    this.types = this.stateActorTypesService.getSelectionTypes();
  }

  onTaskListChange(event, docType: string) {
    this.taskLists[docType] = event?.id;
  }

  save(event) {
    // if (!this.inputName?.length) {
    //   this.msgService.error('Lifecycle::States:Actors:Name:Empty');
    //   this.nameInvalid = true;
    //   return;
    // }

    // if (this.inputName?.length > 60) {
    //   this.msgService.error('Lifecycle::States:Actors:Name:TooLong');
    //   this.nameInvalid = true;
    //   return;
    // }

    // if (this.inputName.trim().length === 0) {
    //   this.msgService.error('Lifecycle::States:Actors:Name:Invalid');
    //   this.nameInvalid = true;
    //   return;
    // }

    // if (!nameRegexp.test(this.inputName)) {
    //   this.msgService.error('Lifecycle::States:Actors:Name:Invalid');
    //   this.nameInvalid = true;
    //   return;
    // }
    if (!this.selectedType) {
      this.messageService.add({
        severity: "error",
        summary: this.localizationService.instant('Lifecycle::States:Actors:Type:Empty'),
      });
      this.typeEmpty = true;
      return;
    }
    if (this.selectedType.value == LifecycleActorTypes.User && !this.selectedUser) {
      this.messageService.add({
        severity: "error",
        summary: this.localizationService.instant('Lifecycle::States:Actors:Type:User:Empty'),
      });
      this.userEmpty = true;
      return;
    }
    if (this.selectedType.value == LifecycleActorTypes.Role && !this.selectedRole) {
      this.messageService.add({
        severity: "error",
        summary: this.localizationService.instant('Lifecycle::States:Actors:Type:Role:Empty'),
      });
      this.roleEmpty = true;
      return;
    }
    this.pageStateService.setNotDirty();
    this.saveEvent.emit({
      isConditional: false,
      ...(this.stateActor ? this.stateActor : undefined),
			isActive: this.selectedActiveState,
      stateTemplateId: this.stateId,
      actorName: this.inputName.trim(),
      actorType: this.selectedType.value,
      isApprovalAdmin: this.approvalAdmin,
      isApprovalManager: this.approvalManager,
      isFormAdmin: this.formAdmin,
      isApprovalNeeded: !this.reviewer,
      taskLists: Object.entries(this.taskLists).map(entry => ({
        documentObjectType: entry[0] as any,
        taskListId: entry[1],
      })),
      refId: {
        [LifecycleActorTypes.Initiator]: undefined,
        [LifecycleActorTypes.User]: this.selectedUser?.id,
        [LifecycleActorTypes.Role]: this.selectedRole?.name,
        [LifecycleActorTypes.Beneficiary]: undefined,
      }[this.selectedType.value],
    });
    //this.msgService.success('Lifecycle::States:Actors:Saved');
  }
  deselectType() {
    this.selectedType = undefined;
  }
  deselectUser() {
    this.selectedUser = undefined;
  }
  deselectRole() {
    this.selectedRole = undefined;
  }

  selectUser(event) {
    this.selectedUser = event;
    this.userEmpty = false;
    if(!this.inputName?.length){
      this.inputName = event?.userName;
      this.pageStateService.setDirty();
    }
  }
  selectRole(event) {
    this.selectedRole = event;
    this.roleEmpty = false;
    if(!this.inputName?.length){
      this.inputName = event?.name;
    }
    this.pageStateService.setDirty();
  }

  getActorSelectionTitle() :string {
    let title = '';
    if(this.selectedType?.value && 
      ((this.selectedType?.value === 2 && this.selectedRole?.id?.length > 0) ||
      (this.selectedType?.value === 1 && this.selectedUser?.id?.length > 0))){
      title = this.localizationService.instant('Lifecycle::States:Actors:Actor');
    }
    else if(this.selectedType?.value && this.selectedType?.value === 1){
      title = this.localizationService.instant('Lifecycle::States:Actors:ChooseActor');
    } else if(this.selectedType?.value && this.selectedType?.value === 2){
      title = this.localizationService.instant('Lifecycle::States:Actors:ChooseRole');
    }
    else{
      title = this.localizationService.instant('Lifecycle::States:Actors:ChooseActor');
    }
    return title;
  }

  actorTypeChange(event){
    this.selectedType = event;
    this.typeEmpty = false;
    this.pageStateService.setDirty();
    if(this.selectedType?.value == LifecycleActorTypes.Initiator){
      this.inputName = "Initiator";
    } else if(this.selectedType?.value == LifecycleActorTypes.Beneficiary){
      this.inputName = "Beneficiary";
    } else if(this.selectedType?.value == LifecycleActorTypes.Role){
      this.inputName = "Role";
    } else if(this.selectedType?.value == LifecycleActorTypes.User){
      this.inputName = "User";
    } else{
      this.inputName = "";
    }
  }

  showRoleSelection() {
    this.identityService.openRoleSelectionDialog({
      title: this.localizationService.instant('Lifecycle::States:Actors:Type:Role:Select'),
      permissions: [],
      selectedRoles: [],
      isMultiple: false,
      ignoredRoles: [],
      onSelect: (roles) => {
        const role = roles[0];
        if (role) {
          this.selectRole(role);
        }
      },
    });
  }

  showUserSelection() {
    this.identityService.openUserSelectionDialog({
      title: this.localizationService.instant('Lifecycle::States:Actors:Type:User:Select'),
      permissions: [],
      selectedUsers: [],
      isMultiple: false,
      ignoredUsers: [],
      onSelect: (users) => {
        const user = users[0];
        if (user) {
          this.selectUser(user);
        }
      },
    });
  }
}
