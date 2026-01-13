import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { finalize, first } from "rxjs";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { TenantService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { HostService } from '@eleon/tenant-management-proxy';
import { TenantCreateDto } from '@eleon/eleoncore-multi-tenancy-proxy';
import { CreateTenantRequestDto } from '@eleon/eleoncore-multi-tenancy-proxy';

@Component({
  standalone: false,
  selector: "app-tenant-management-create-dialog",
  templateUrl: "./tenant-management-create-dialog.component.html",
  styleUrls: ["./tenant-management-create-dialog.component.scss"],
})
export class TenantManagementCreateDialogComponent implements OnInit {
  display: boolean = false;
  title: string;
  sharedDbChecked: boolean = false;
  defaultConnString: string = null;
  tenantDto: TenantCreateDto = {
    adminEmailAddress: "",
    adminPassword: "",
    name: "",
  };
  isCreateDatabase: boolean = false;
  newDatabaseName: string;
  newUserName: string;
  subDomainName: string = "";
  newUserPassword: string;
  loading = false;
  errorMessage: string;
  isCreateSubDomain: boolean = false;
  activeIndex: number = 0;
  adminPasswordEmpty: boolean = false;
  adminEmailAddressEmpty: boolean = false;
  tenantNameEmpty: boolean = false;
  newDatabaseNameEmpty: boolean = false;
  newUserNameEmpty: boolean = false;
  newUserPasswordEmpty: boolean = false;
  defaultConnStringEmpty: boolean = false;
  subDomainNameEmpty: boolean = false;

  @Input()
  domainName: string;

  @Output()
  saveClicked = new EventEmitter<void>();

  constructor(
    public localizationService: ILocalizationService,
    public tenantService: TenantService,
    public messageService: LocalizedMessageService,
    public hostService: HostService
  ) {
    if (!this.title) {
      this.title = this.localizationService.instant(
        "Infrastructure::TenantManagement:Tenant:Create:Title"
      );
    }
  }

resetAll(){
  this.resetDbValidators();
  this.resetTenantVallidators();
  this.resetDefaultConnStringValidator();
  this.resetSubDomainValidator();
  this.tenantDto = {
    adminEmailAddress: "",
    adminPassword: "",
    name: "",
  } as TenantCreateDto;
}

visibleChange(event){
    if(!event){
      this.resetAll();
    }
  }

  ngOnInit(): void {
    return;
  }

  showDialog() {
    this.display = true;
  }

  closeDialog() {
    this.resetAll();
    this.saveClicked.emit();
    this.display = false;
  }

  resetTenantVallidators(): void {
    this.tenantNameEmpty = false;
    this.adminEmailAddressEmpty = false;
    this.adminPasswordEmpty = false;
  }

  resetDbValidators(): void {
    this.newDatabaseNameEmpty = false;
    this.newUserNameEmpty = false;
    this.newUserPasswordEmpty = false;
  }

  resetDefaultConnStringValidator(): void {
    this.defaultConnStringEmpty = false;
  }

  resetSubDomainValidator(): void {
    this.subDomainNameEmpty = false;
  }

  validateData() {
    let isValid = true;
    if (!this.tenantDto.name) {
      this.messageService.error(
        "Infrastructure::TenantManagement:TenantNameEmpty"
      );
      isValid = false;
      this.tenantNameEmpty = true;
    }

    if (!this.tenantDto.adminEmailAddress) {
      this.messageService.error(
        "Infrastructure::TenantManagement:AdminEmailAddressEmpty"
      );
      isValid = false;
      this.adminEmailAddressEmpty = true;
    }

    if (!!this.tenantDto.adminEmailAddress?.length && !this.isValidEmail(this.tenantDto.adminEmailAddress)) {
      this.messageService.error(
        "Infrastructure::TenantManagement:AdminEmailAddressInvalid"
      );
      isValid = false;
      this.adminEmailAddressEmpty = true;
    }

    if (!this.tenantDto.adminPassword) {
      this.messageService.error(
        "Infrastructure::TenantManagement:AdminPasswordEmpty"
      );
      isValid = false;
      this.adminPasswordEmpty = true;
    }

    if (!isValid) {
      this.activeIndex = 0;
      return isValid;
    }

    if (this.isCreateDatabase) {
      if (
        !this.newDatabaseName ||
        this.newDatabaseName.replace(/-/g, "_")?.length <= 0
      ) {
        this.messageService.error(
          "Infrastructure::TenantManagement:DatabaseNameEmpty"
        );
        isValid = false;
        this.newDatabaseNameEmpty = true;
      }
      if (
        !this.newUserName ||
        this.newUserName.replace(/-/g, "_")?.length <= 0
      ) {
        this.messageService.error(
          "Infrastructure::TenantManagement:UserNameEmpty"
        );
        isValid = false;
        this.newUserNameEmpty = true;
      }
      if (!this.newUserPassword) {
        isValid = false;
        this.messageService.error(
          "Infrastructure::TenantManagement:UserPasswordEmpty"
        );
        this.newUserPasswordEmpty = true;
      }
    }

    // if (!this.isCreateDatabase && !this.defaultConnString) {
    //   this.messageService.error(
    //     "Infrastructure::TenantManagement:DefaultConnectionStringEmpty"
    //   );
    //   isValid = false;
    //   this.defaultConnStringEmpty = true;
    // }

    if (!isValid) {
      this.activeIndex = 1;
      return isValid;
    }

    // if (this.isCreateSubDomain && !this.subDomainName) {
    //   isValid = false;
    //   this.messageService.error(
    //     "Infrastructure::TenantManagement:SubDomainNameEmpty"
    //   );
    //   this.subDomainNameEmpty = true;
    // }

    // if (!isValid) {
    //   this.activeIndex = 1;
    //   return isValid;
    // }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
  }

  saveTenant() {
    if (!this.validateData()) {
      return;
    }

    this.loading = true;
    const request: CreateTenantRequestDto = {
      tenantName: this.tenantDto.name,
      createDatabase: this.isCreateDatabase,
      newDatabaseName: this.newDatabaseName,
      newUserName: this.newUserName,
      newUserPassword: this.newUserPassword,
      defaultConnectionString: this.defaultConnString,
      adminEmail: this.tenantDto.adminEmailAddress,
      isRoot: this.tenantDto['isRoot'],
      adminPassword: this.tenantDto.adminPassword,
    };
    this.tenantService
      .createCommonTenantByRequest(request)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((x) => {
        if (x.success) {
          this.messageService.success(
            "Infrastructure::TenantManagement:Header:Add:Success"
          );
          this.closeDialog();
        } else {
          this.messageService.error(
            "Infrastructure::TenantManagement:Header:Add:Error"
          );
          this.errorMessage = x.error;
        }
      });
  }

  getCreatedSubdomainName(): string {
    return "https://" + this.subDomainName + "." + this.domainName;
  }

  onKeyPress(event: KeyboardEvent) {
    const keyPressed = event.key;
    const validCharacters = /^[A-Za-z0-9]+$/;
    if (!validCharacters.test(keyPressed) || this.loading) {
      event.preventDefault();
    }
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

  changeCreateDb(event) {
    if (event) {
      this.defaultConnString = null;
      this.generatePassword();
    }
  }

  changeCreateSubdomain(event) {
    if (event) {
      this.subDomainName = "";
    }
  }

  createSubDomain(tenantId) {
    // this.loading = true;
    // this.vpTenantService.createSubDomainByTenantIdAndSubDomainNameAndIsAddToIis(
    //   tenantId,
    //   this.subDomainName,
    //   false,
    // ).subscribe((reply) => {
    //   if(reply && reply?.length > 0) {
    //     this.errorMessage = reply;
    //     this.loading = false;
    //     return;
    //   }
    //   this.loading = false;
    //   this.closeDialog();
    //   this.messageService.success('Infrastructure::TenantManagement:SubDomainAddedSuccessfully');
    // });
  }
}
