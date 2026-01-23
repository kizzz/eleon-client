import { Component, ContentChild, Input, OnInit, TemplateRef, Output, EventEmitter} from '@angular/core';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { HostService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { TenantDto } from '@eleon/eleoncore-multi-tenancy-proxy';
import { TenantService } from '@eleon/eleoncore-multi-tenancy-proxy';

@Component({
  standalone: false,
  selector: 'app-create-database-dialog',
  templateUrl: './create-database-dialog.component.html',
  styleUrls: ['./create-database-dialog.component.scss']
})
export class CreateDatabaseDialogComponent implements OnInit {
  display = false;
  loading = false;
  errorMessage: string;
  @ContentChild(TemplateRef)
  public button: TemplateRef<any>;
  @Input()
  public beforeButton: TemplateRef<any>;
  @Input()
  title: string;
  @Input()
  tenant: TenantDto;
  @Input()
  connectionString: string;

  @Output()
  closeDialogEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  newDatabaseName: string;
  newUserName: string;
  newUserPassword: string;
  newDatabaseNameEmpty: boolean = false;
  newUserNameEmpty: boolean = false;
  newUserPasswordEmpty: boolean = false;

  constructor(
    public localizationService: ILocalizationService,
    public tenantService: TenantService,
    public messageService: LocalizedMessageService,
    public hostService: HostService,
  ) {
    if (!this.title) {
      this.title = this.localizationService.instant('Infrastructure::TenantManagement:CreateDatabase');
    }
  }

  ngOnInit(): void {
    return;
  }

  showDialog() {
    this.display = true;
    this.newDatabaseName = this.tenant.name + '_DB';
    this.newUserName = this.tenant.name + '_User';
    this.generatePassword();
  }

  closeDialog(){
    this.display = false;
    this.closeDialogEvent.emit(true);
  }

  resetUserNameValidator(): void {
    this.newUserNameEmpty = false;
  }

  resetUserPasswordValidator(): void {
    this.newUserPasswordEmpty = false;
  }

  resetDatabaseValidator(): void {
    this.newDatabaseNameEmpty = false;
  }

  generatePassword() {
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const digitChars = "0123456789";
    const specialChars = "!@#$%^&*()_+";
    let charset = upperChars + lowerChars + digitChars + specialChars;
    let password = "";
    const charsetLength = charset.length;

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * charsetLength);
      password += charset[randomIndex];
    }
    this.newUserPassword = password;
  }

  createDatabase() {
    let isValid = true;
    if (!this.newDatabaseName || this.newDatabaseName.replace(/-/g, '_')?.length <=0) {
      this.messageService.error('Infrastructure::TenantManagement:DatabaseNameEmpty');
      this.newDatabaseNameEmpty = true;
      isValid = false;
    }
    if (!this.newUserName || this.newUserName.replace(/-/g, '_')?.length <=0) {
      this.messageService.error('Infrastructure::TenantManagement:UserNameEmpty');
      this.newUserNameEmpty = true;
      isValid = false;
    }
    if (!this.newUserPassword) {
      isValid = false;
      this.messageService.error('Infrastructure::TenantManagement:UserPasswordEmpty');
      this.newUserPasswordEmpty = true;
    }
    if (!isValid) return;
    this.send();
  }

  send(){
    this.errorMessage = '';
    this.loading = true;
    this.newDatabaseName = this.newDatabaseName.replace(/-/g, '_');
    this.newUserName = this.newUserName.replace(/-/g, '_');
    this.tenantService.createDatabaseByCreateDatabaseDto({
      newDatabaseName: this.newDatabaseName,
      tenantId: this.tenant.id,
      newUserName: this.newUserName,
      newUserPassword: this.newUserPassword,
    }).subscribe((reply) => {
      if(reply && reply?.length > 0) {
        this.errorMessage = reply;
        this.loading = false;
        return;
      }
      this.messageService.success('Infrastructure::TenantManagement:DatabaseCreatedSuccessfully');
      this.hostService.migrate(this.tenant.id).subscribe(() => {
        this.messageService.success('Infrastructure::TenantManagement:DatabaseMigratedSuccessfully');
        this.closeDialog();
        this.loading = false;
      });
    });
  }
}
