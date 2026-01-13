import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ControlDelegationService } from '@eleon/tenant-management-proxy';
import { CommonUserDto } from '@eleon/tenant-management-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { IIdentitySelectionDialogService } from "@eleon/contracts.lib";

interface ControlDelegation {
  user: CommonUserDto;
  delegationStartDate: Date;
  delegationEndDate: Date;
  reason: string;
}

@Component({
  standalone: false,
  selector: "app-control-delegation-creation-dialog",
  templateUrl: "./control-delegation-creation-dialog.component.html",
  styleUrls: ["./control-delegation-creation-dialog.component.scss"],
})
export class ControlDelegationCreationDialogComponent {
  @Input()
  showDialog: boolean;
  @Output()
  showDialogChange = new EventEmitter<boolean>();

  @Output()
  added: EventEmitter<void> = new EventEmitter<void>();

  delegation: ControlDelegation = {} as ControlDelegation;
  today = new Date();

  constructor(private controlDelegationService: ControlDelegationService, private msgService: LocalizedMessageService,
    private userSelectionService: IIdentitySelectionDialogService
  ) {}

  public onUserSelected(user: CommonUserDto) {
    this.delegation.user = user;
  }

  public show(): void {
    this.showDialog = true;
    this.showDialogChange.emit(this.showDialog);
    this.delegation = {} as ControlDelegation;
  }

  public cancel(): void {
    this.showDialog = false;
    this.showDialogChange.emit(this.showDialog);
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }

    this.controlDelegationService
      .addControlDelegationByRequest({
        delegatedToUserId: this.delegation.user.id,
        delegationStartDate: this.delegation.delegationStartDate.toISOString(),
        delegationEndDate: this.delegation.delegationEndDate?.toISOString(),
        reason: this.delegation.reason,
      })
      .subscribe(() => {
        this.showDialog = false;
        this.showDialogChange.emit(this.showDialog);
        this.msgService.success("TenantManagement::ControlDelegation:DelegationCreatedSuccessfully");
        this.added.emit();
      });
  }

  private validate(): boolean {
    let errors: string[] = [];
    if (!this.delegation.user) {
      errors.push("TenantManagement::ControlDelegation:Error:UserIsRequired");
    }

    if (!this.delegation.delegationStartDate) {
      errors.push("TenantManagement::ControlDelegation:Error:StartDateIsRequired");
    }

    this.msgService.errorMany(errors);
    return errors.length === 0;
  }

  showUserSelection(): void {
    this.userSelectionService.openUserSelectionDialog({
      isMultiple: false,
      onSelect: (users) => {
        const selectedUser = users[0];
        if (selectedUser)
          {
          this.onUserSelected(users[0]);
          }
      },
      title: "TenantManagement::ControlDelegation:SelectUserForDelegation",
      permissions: [],
      selectedUsers: [],
      ignoredUsers: []
    });
  }
}
