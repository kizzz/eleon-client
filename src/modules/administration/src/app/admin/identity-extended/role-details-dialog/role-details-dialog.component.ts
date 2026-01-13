import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { IdentityRoleDto, IdentityRoleUpdateDto, RoleService } from '@eleon/tenant-management-proxy';
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { catchError, finalize, first, throwError } from "rxjs";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { SUPER_ADMIN_ROLE } from '../const/identity-constants'

@Component({
  standalone: false,
  selector: "app-role-details-dialog",
  templateUrl: "./role-details-dialog.component.html",
  styleUrl: "./role-details-dialog.component.scss",
})
export class RoleDetailsDialogComponent implements OnInit {
  @Input()
  display: boolean;
@Output()
  displayChange = new EventEmitter<boolean>();

  role: IdentityRoleDto = {} as IdentityRoleDto;
  originalRole: IdentityRoleDto = {} as IdentityRoleDto;

  @Input()
  roleId: string;

  nameEmpty: boolean = false;
  loading: boolean = false;

  yesNoOptions : { label: string; value: boolean }[] = [];

  @Output()
  saveEvent = new EventEmitter<boolean>();

  @Output()
  closeEvent = new EventEmitter<boolean>();

  constructor(
    private confirmationService: LocalizedConfirmationService,
    public localizationService: ILocalizationService,
    private messageService: LocalizedMessageService,
    private identityRoleService: RoleService,
    private pageStateService: PageStateService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.yesNoOptions = [
      { label: this.localizationService.instant('Infrastructure::Yes'), value: true },
      { label: this.localizationService.instant('Infrastructure::No'), value: false },
    ];
    this.identityRoleService.get(this.roleId)
    .subscribe(reply=>{
      this.loading = false;
      this.role = reply;
      this.originalRole = JSON.parse(JSON.stringify(reply));
    })
  }

  update() {
    if (!this.role.name) {
      this.nameEmpty = true;
      this.messageService.error("TenantManagement::RoleNameEmpty");
      return;
    }

    if (this.originalRole?.name === SUPER_ADMIN_ROLE) {
      this.messageService.error("TenantManagement::Role:Edit:CantEditSuperAdmin");
      return;
    }

    this.loading = true;
    let updatedRole = {} as IdentityRoleUpdateDto;
    updatedRole.isDefault = this.role.isDefault;
    updatedRole.isPublic = this.role.isPublic;
    updatedRole.name = this.role.name;
    this.identityRoleService
      .update(this.role.id, updatedRole)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.messageService.error('TenantManagement::Role:UpdateFailed');
          return throwError(() => error);
        })
      )
      .pipe(first())
      .subscribe((result) => {
        this.loading = false;
        if (result != null) {
          this.messageService.success("TenantManagement::Role:Update:Success");
          this.display = false;
          this.displayChange.emit(false);
          this.saveEvent.emit(true);
        } else {
          this.messageService.error("TenantManagement::Role:Update:Error");
        }
      });
  }

  resetNameValidator() {
    this.nameEmpty = false;
  }

  cancel() {
    if (this.pageStateService.isDirty) {
      this.confirmationService.confirm(
        "Infrastructure::ConfirmLeavingDirty",
        () => {
          this.pageStateService.setNotDirty();
          this.role = null;
          this.display = false;
          this.displayChange.emit(false);
          this.resetNameValidator();
          this.closeEvent.emit(true);
        }
      );
    } else {
      this.display = false;
      this.displayChange.emit(false);
      this.resetNameValidator();
      this.closeEvent.emit(true);
    }
  }
}
