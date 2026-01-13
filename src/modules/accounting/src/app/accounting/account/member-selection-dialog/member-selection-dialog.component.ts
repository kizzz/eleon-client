import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MemberDto, MemberType } from '@eleon/accounting-proxy';
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
  selectedMembers: MemberDto[] = [];

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  selectEvent = new EventEmitter<MemberDto[]>();

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
        this.selectedMembers.some(selected => selected.id === row.data.id)
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
    const selectedMembers = this.selectedRows.map(row => row.data);
    this.selectEvent.emit(selectedMembers);
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
