import { Component, ContentChild, Input, OnInit, TemplateRef, Output, EventEmitter} from '@angular/core';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { HostService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { TenantDto } from '@eleon/eleoncore-multi-tenancy-proxy';
import { TenantService } from '@eleon/eleoncore-multi-tenancy-proxy';

@Component({
  standalone: false,
  selector: 'app-create-sub-domain-dialog',
  templateUrl: './create-sub-domain-dialog.component.html',
  styleUrls: ['./create-sub-domain-dialog.component.scss']
})

export class CreateSubDomainDialogComponent implements OnInit{
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
  domainName: string;

  @Output()
  closeDialogEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  name: string;
  newNameEmpty: boolean = false;
  isAddToDns: boolean = true;
  isAddToIis: boolean = true;

  constructor(
    public localizationService: ILocalizationService,
    public tenantService: TenantService,
    public messageService: LocalizedMessageService,
    public hostService: HostService,
  ) {
    if (!this.title) {
      this.title = this.localizationService.instant('Infrastructure::TenantManagement:CreateSubdomain');
    }
  }

  ngOnInit(): void {
    return;
  }

  showDialog() {
    this.display = true;
    this.name = this.tenant.name.replace(/[^a-zA-Z0-9]/g, '');
  }

  closeDialog(){
    this.display = false;
    this.closeDialogEvent.emit(true);
  }

  getCreatedSubdomainName(): string {
    return 'https://'+this.name+'.'+this.domainName;
  }

  onKeyPress(event: KeyboardEvent) {
    const keyPressed = event.key;
    const validCharacters = /^[A-Za-z0-9]+$/;
    if (!validCharacters.test(keyPressed) || this.loading) {
      event.preventDefault();
    }
  }

  create() {
    // if(!this.isAddToIis && !this.isAddToDns) return;

    // if (!this.name) {
    //   this.messageService.error('Infrastructure::TenantManagement:SubDomainNameEmpty');
    //   this.newNameEmpty = true;
    //   return;
    // }
    // this.loading = true;
    // this.errorMessage = '';
    // if(!this.isAddToDns && this.isAddToIis){
    //   this.tenantService.createBindingToIISByTenantId(
    //     this.tenant.id,
    //   ).subscribe((reply) => {
    //     if(reply && reply?.length > 0) {
    //       this.errorMessage = reply;
    //       this.loading = false;
    //       return;
    //     }
    //     this.loading = false;
    //     this.closeDialog();
    //     this.messageService.success('Infrastructure::TenantManagement:SubDomainAddedSuccessfully');
    //   });
    // }
    // else{
    //   this.tenantService.createSubDomainByTenantIdAndSubDomainNameAndIsAddToIis(
    //     this.tenant.id,
    //     this.name,
    //     this.isAddToDns,
    //   ).subscribe((reply) => {
    //     if(reply && reply?.length > 0) {
    //       this.errorMessage = reply;
    //       this.loading = false;
    //       return;
    //     }
    //     this.loading = false;
    //     this.closeDialog();
    //     this.messageService.success('Infrastructure::TenantManagement:SubDomainAddedSuccessfully');
    //   });
    // }
  }
}
