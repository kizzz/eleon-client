import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MemberDto, MemberType, LinkedMemberDto } from '@eleon/accounting-proxy';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';

interface MemberTableRow {
  data: MemberDto;
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
  members: MemberDto[] = [];

  @Input()
  selectedMembers: LinkedMemberDto[] = [];

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  selectEvent = new EventEmitter<LinkedMemberDto[]>();

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

  ngOnChanges(): void {
    if (this.display) {
      this.initializeRows();
      this.initializeSelectedRows();
    }
  }

  initializeRows(): void {
    this.rows = (this.members || []).map(m => ({ data: m }));
  }

  initializeSelectedRows(): void {
    if (this.selectedMembers && this.selectedMembers.length > 0) {
      this.selectedRows = this.rows.filter(row =>
        this.selectedMembers.some(selected => selected.memberEntityId === row.data.id)
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
    const selectedLinkedMembers: LinkedMemberDto[] = this.selectedRows.map(row => ({
      memberEntityId: row.data.id
    }));
    this.selectEvent.emit(selectedLinkedMembers);
    this.onDialogHide();
  }

  cancel(): void {
    this.onDialogHide();
  }

  getMemberTypeName(type: MemberType): string {
    return this.localizationService.instant(
      `AccountingModule::MemberType:${MemberType[type]}`
    );
  }
}
