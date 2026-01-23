import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { 
  PackageType,
  UserMemberDto,
  TenantMemberDto,
  LinkedUserDto,
  LinkedTenantDto
} from '@eleon/accounting-proxy';

interface MemberDisplayItem {
  id?: string;
  type: 'user' | 'tenant';
  refId?: string;
  userMember?: UserMemberDto;
  tenantMember?: TenantMemberDto;
}

interface MemberTableRow {
  data: MemberDisplayItem;
}

@Component({
  standalone: false,
  selector: 'app-member-selection-dialog',
  templateUrl: './member-selection-dialog.component.html',
  styleUrls: ['./member-selection-dialog.component.scss']
})
export class MemberSelectionDialogComponent implements OnInit, OnChanges {
  @Input()
  display: boolean = false;

  @Input()
  members: (UserMemberDto | TenantMemberDto)[] = [];

  @Input()
  selectedMembers: (LinkedUserDto | LinkedTenantDto)[] = [];

  @Input()
  packageType?: PackageType; // Filter members based on package template type

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  selectEvent = new EventEmitter<(LinkedUserDto | LinkedTenantDto)[]>();

  rows: MemberTableRow[];
  selectedRows: MemberTableRow[] = [];
  viewportBreakpoints = viewportBreakpoints;
  title: string;

  constructor(
    public localizationService: ILocalizationService
  ) {}

  ngOnInit(): void {
    this.title = this.localizationService.instant('AccountingModule::MemberSelection');
    this.initializeRows();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.display || changes['members'] || changes['packageType']) {
      this.initializeRows();
      this.initializeSelectedRows();
    }
  }

  initializeRows(): void {
    // Convert to MemberDisplayItem format
    let displayItems: MemberDisplayItem[] = (this.members || []).map((m) => {
      // Determine type by checking which properties exist
      if ('userId' in m && m.userId !== undefined) {
        return {
          id: m.id,
          type: 'user' as const,
          refId: m.userId,
          userMember: m as UserMemberDto,
        };
      } else if ('refTenantId' in m && m.refTenantId !== undefined) {
        return {
          id: m.id,
          type: 'tenant' as const,
          refId: m.refTenantId,
          tenantMember: m as TenantMemberDto,
        };
      }
      // Fallback - shouldn't happen but handle gracefully
      return {
        id: m.id,
        type: 'user' as const,
        refId: '',
        userMember: m as any,
      };
    });
    
    // Filter members based on packageType if provided
    if (this.packageType !== undefined && this.packageType !== null) {
      if (this.packageType === PackageType.User) {
        // Show only user members
        displayItems = displayItems.filter(m => m.type === 'user');
      } else if (this.packageType === PackageType.Tenant) {
        // Show only tenant members
        displayItems = displayItems.filter(m => m.type === 'tenant');
      }
    }
    
    this.rows = displayItems.map(m => ({ data: m }));
  }

  initializeSelectedRows(): void {
    if (this.selectedMembers && this.selectedMembers.length > 0) {
      // Create a set of selected member IDs for efficient lookup
      const selectedIds = new Set(
        this.selectedMembers
          .map(m => {
            if ('userMemberEntityId' in m) {
              return m.userMemberEntityId;
            } else if ('tenantMemberEntityId' in m) {
              return m.tenantMemberEntityId;
            }
            return undefined;
          })
          .filter((id): id is string => !!id)
      );
      
      this.selectedRows = this.rows.filter(row => 
        row.data.id && selectedIds.has(row.data.id)
      );
    } else {
      this.selectedRows = [];
    }
  }

  onDialogShow(): void {
    this.initializeRows();
    this.initializeSelectedRows();
  }

  onDialogHide(): void {
    this.displayChange.emit(false);
  }

  onSelect(): void {
    const selectedLinkedMembers: (LinkedUserDto | LinkedTenantDto)[] = this.selectedRows.map(row => {
      if (row.data.type === 'user' && row.data.id) {
        return {
          userMemberEntityId: row.data.id
        } as LinkedUserDto;
      } else if (row.data.type === 'tenant' && row.data.id) {
        return {
          tenantMemberEntityId: row.data.id
        } as LinkedTenantDto;
      }
      // Fallback - shouldn't happen
      return {} as LinkedUserDto;
    }).filter(m => ('userMemberEntityId' in m && !!m.userMemberEntityId) || ('tenantMemberEntityId' in m && !!m.tenantMemberEntityId));
    
    this.selectEvent.emit(selectedLinkedMembers);
    this.onDialogHide();
  }

  cancel(): void {
    this.onDialogHide();
  }

  getMemberTypeName(member: MemberDisplayItem): string {
    const typeKey = member.type === 'user' ? 'User' : 'Tenant';
    return this.localizationService.instant(`AccountingModule::MemberType:${typeKey}`);
  }

  getMemberRefId(member: MemberDisplayItem): string {
    return member.refId || '-';
  }
}
