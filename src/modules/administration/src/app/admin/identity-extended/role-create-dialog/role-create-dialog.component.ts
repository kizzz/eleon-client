
import { IdentityRoleCreateDto, RoleService } from '@eleon/tenant-management-proxy';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { catchError, finalize, first, throwError } from 'rxjs';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';

@Component({
  standalone: false,
  selector: 'app-role-create-dialog',
  templateUrl: './role-create-dialog.component.html',
  styleUrl: './role-create-dialog.component.scss'
})
export class RoleCreateDialogComponent {
  @Input()
  display: boolean;
  @Output()
  displayChange = new EventEmitter<boolean>();

  roleName: string;
  isPublic:boolean = false;
  isDefault: boolean = false;
  nameEmpty: boolean = false;
  loading: boolean = false;

  @Output()
  saveEvent = new EventEmitter<boolean>();

  @Output()
  closeEvent = new EventEmitter<boolean>();

  constructor(
    private confirmationService: LocalizedConfirmationService,
    private messageService: LocalizedMessageService,
    private identityRoleService: RoleService,
    private pageStateService: PageStateService
  ) {

  }

  create() {
    if(!this.roleName){
      this.nameEmpty = true;
      this.messageService.error('TenantManagement::RoleNameEmpty');
      return;
    }

    this.loading = true;
      let newRole = {} as IdentityRoleCreateDto;
      newRole.isDefault = this.isDefault;
      newRole.isPublic = this.isPublic;
      newRole.name = this.roleName;
      this.identityRoleService.create(
        newRole
      )
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.messageService.error('TenantManagement::Role:New:Error');
          return throwError(() => error);
        }))
      .pipe(first())
        .subscribe(result => {
          this.loading = false;
          if(result != null){
            this.messageService.success('TenantManagement::Role:New:Success');
            this.display = false;
            this.displayChange.emit(false);
            this.saveEvent.emit(true);
          } 
          else{
            this.messageService.error('TenantManagement::Role:New:Error');
          }
        });
  }

  resetNameValidator(){
    this.nameEmpty = false;
  }

  cancel(){
    if(this.pageStateService.isDirty){
      this.confirmationService.confirm(
        'Infrastructure::ConfirmLeavingDirty',
        () => {
          this.pageStateService.setNotDirty();
          this.roleName = null;
          this.isDefault = false;
          this.isPublic = false;
          this.display = false;
          this.displayChange.emit(false);
          this.resetNameValidator();
          this.closeEvent.emit(true);
        });
      }
    else{
      this.roleName = null;
      this.isDefault = false;
      this.isPublic = false;
      this.display = false;
      this.displayChange.emit(false);
      this.resetNameValidator();
      this.closeEvent.emit(true);
    }
  }
}
