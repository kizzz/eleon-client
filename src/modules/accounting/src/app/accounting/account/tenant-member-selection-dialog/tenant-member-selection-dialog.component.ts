import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { 
  TenantMemberDto,
  LinkedTenantDto,
  TenantMemberListRequestDto,
  AccountMemberService,
} from '@eleon/accounting-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { finalize } from 'rxjs';

interface TenantTableRow {
  data: TenantMemberDto;
}

@Component({
  standalone: false,
  selector: 'app-tenant-member-selection-dialog',
  templateUrl: './tenant-member-selection-dialog.component.html',
  styleUrls: ['./tenant-member-selection-dialog.component.scss']
})
export class TenantMemberSelectionDialogComponent implements OnInit, OnChanges {
  @Input()
  display: boolean = false;

  @Input()
  accountId: string;

  @Input()
  accountPackageId: string;

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  tenantAdded = new EventEmitter<LinkedTenantDto>();

  rows: TenantTableRow[] = [];
  selectedRow: TenantTableRow | null = null;
  viewportBreakpoints = viewportBreakpoints;
  title: string;
  loading: boolean = false;
  saving: boolean = false;

  constructor(
    public localizationService: ILocalizationService,
    private messageService: LocalizedMessageService,
    private accountMemberService: AccountMemberService
  ) {}

  ngOnInit(): void {
    this.title = this.localizationService.instant('AccountingModule::TenantMemberSelection');
    if (this.display && this.accountId) {
      this.loadTenantMembers();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['display'] && this.display && this.accountId) {
      this.loadTenantMembers();
      this.selectedRow = null;
    }
  }

  loadTenantMembers(): void {
    if (!this.accountId) return;

    this.loading = true;
    const request: TenantMemberListRequestDto = {
      accountId: this.accountId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    this.accountMemberService
      .getTenantMembers(request)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          const tenantMembers: TenantMemberDto[] = result.items || [];
          this.rows = tenantMembers.map(m => ({ data: m }));
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:LoadTenantMembersFailed");
          this.rows = [];
        },
      });
  }

  onDialogShow(): void {
    if (this.accountId) {
      this.loadTenantMembers();
      this.selectedRow = null;
    }
  }

  onDialogHide(): void {
    this.displayChange.emit(false);
  }

  onSelect(): void {
    if (!this.accountPackageId) {
      this.messageService.error("AccountingModule::Error:AccountPackageIdRequired");
      return;
    }

    if (!this.selectedRow || !this.selectedRow.data.id) {
      this.messageService.warn("AccountingModule::Warning:NoTenantSelected");
      return;
    }

    this.saving = true;
    const createDto = { tenantMemberEntityId: this.selectedRow.data.id };

    this.accountMemberService
      .addLinkedTenant(this.accountPackageId, createDto)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.messageService.success("AccountingModule::Success:LinkedTenantAdded");
          this.tenantAdded.emit(result);
          this.onDialogHide();
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:AddLinkedTenantFailed");
        },
      });
  }

  cancel(): void {
    this.onDialogHide();
  }
}
