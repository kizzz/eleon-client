import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { DocumentVersionEntity } from '@eleon/auditor-proxy';

@Component({
  standalone: false,
  selector: 'app-audit-history-dialog',
  templateUrl: './audit-history-dialog.component.html',
  styleUrls: ['./audit-history-dialog.component.scss']
})
export class AuditHistoryDialogComponent implements OnInit {
  @Input()
  public icon: string;
  @Input()
  public beforeButton: TemplateRef<any>;
  @Input()
  public disableLoading: boolean = false;
  @Input()
  public documentObjectType: string;
  @Input()
  public documentId: string;
  @Input()
  showArchiveVersionWarning: boolean | undefined;
  @Input()
  version: DocumentVersionEntity | undefined;


  @Input()
  showDialog = false;
  @Output()
  showDialogChange = new EventEmitter<boolean>();

  @Output()
  onRecordSelected: EventEmitter<DocumentVersionEntity> = new EventEmitter<DocumentVersionEntity>();

  constructor() { }

  ngOnInit(): void {
    return;
  }

  onShowBtnClick(): void {
    this.changeShowDialog(true);
  }

  changeShowDialog(value: boolean) {
    this.showDialog = value;
    this.showDialogChange.emit(value);
  }

  onSelectedRecordChange(event): void {
    this.onRecordSelected.emit(event);
    this.changeShowDialog(false);
  }
}
