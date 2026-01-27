import { ILocalizationService, IIdentitySelectionDialogService, CommonTenantDto } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';

export interface TenantMemberDisplayItem {
  id?: string;
  refTenantId?: string;
}

@Component({
  standalone: false,
  selector: 'app-tenant-member-create',
  templateUrl: './tenant-member-create.component.html',
  styleUrls: ['./tenant-member-create.component.scss']
})
export class TenantMemberCreateComponent implements OnInit, OnChanges {
  @Input()
  display: boolean = false;

  @Input()
  memberData: TenantMemberDisplayItem | null = null;

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  saveEvent = new EventEmitter<{ refTenantId: string }>();

  refTenantId: string = '';
  refTenantIdEmpty: boolean = false;
  loading: boolean = false;

  selectedTenant: CommonTenantDto | null = null;
  selectedEntityName: string = '';

  constructor(
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    private pageStateService: PageStateService,
    private identitySelectionService: IIdentitySelectionDialogService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  ngOnChanges(): void {
    // Changes will be handled in onDialogShow when dialog becomes visible
  }

  onDialogShow(): void {
    if (this.memberData) {
      // Editing existing member
      this.refTenantId = this.memberData.refTenantId || '';
      // Set selectedEntityName to refTenantId if we don't have the entity details
      this.selectedEntityName = this.memberData.refTenantId || '';
    } else {
      // Creating new member
      this.refTenantId = '';
    }
    this.refTenantIdEmpty = false;
    this.selectedTenant = null;
    if (!this.selectedEntityName) {
      this.selectedEntityName = '';
    }
  }

  onDialogHide(): void {
    this.displayChange.emit(false);
    this.selectedTenant = null;
    this.selectedEntityName = '';
    this.refTenantId = '';
    this.resetRefTenantIdValidator();
  }

  save(): void {
    const valid = this.validate();
    if (!valid) return;

    this.pageStateService.setDirty();
    const saveData: { refTenantId: string } = {
      refTenantId: this.refTenantId,
    };
    this.saveEvent.emit(saveData);
    this.onDialogHide();
  }

  cancel(): void {
    this.onDialogHide();
  }

  validate(): boolean {
    this.refTenantIdEmpty = false;
    let errors: string[] = [];

    if (!this.refTenantId || this.refTenantId.trim().length === 0) {
      this.refTenantIdEmpty = true;
      errors.push('AccountingModule::Error:RefTenantIdEmpty');
    }

    if (errors.length > 0) {
      for (const err of errors) {
        this.messageService.error(err);
      }
      return false;
    }

    return true;
  }

  resetRefTenantIdValidator(): void {
    this.refTenantIdEmpty = false;
  }

  openTenantSelectionDialog(): void {
    this.identitySelectionService.openTenantSelectionDialog({
      title: this.localizationService.instant('AccountingModule::TenantSelection'),
      isMultiple: false,
      selectedTenants: this.selectedTenant ? [this.selectedTenant] : [],
      ignoredTenants: [],
      onSelect: (tenants) => {
        if (tenants && tenants.length > 0) {
          this.selectedTenant = tenants[0];
          this.selectedEntityName = tenants[0].name || '';
          this.refTenantId = tenants[0].id || '';
          this.resetRefTenantIdValidator();
        }
      }
    });
  }
}
