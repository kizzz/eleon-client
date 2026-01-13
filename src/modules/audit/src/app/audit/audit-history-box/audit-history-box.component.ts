import { Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output } from '@angular/core';
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { AuditHistoryRecordService } from '@eleon/auditor-proxy';
import { DocumentVersionEntity } from '@eleon/auditor-proxy';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { first } from 'rxjs/operators';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-audit-history-box',
  templateUrl: './audit-history-box.component.html',
  styleUrls: ['./audit-history-box.component.scss'],
})
export class AuditHistoryBoxComponent implements OnInit {
  records: DocumentVersionEntity[];
  totalRecords: number;
  loading: boolean;
  selectAll: boolean = false;
  filter: string;
  rows: number = 10;
  searchQueryText: string;
  searchQuery?: string;
  lastLazyLoadEvent?: LazyLoadEvent = null;

  @Input()
  disableLoading: boolean = false;
  @Input()
  documentObjectType: string;
  @Input()
  documentId: string;

  @Output()
  onRecordSelected: EventEmitter<DocumentVersionEntity> =
    new EventEmitter<DocumentVersionEntity>();

  constructor(
    public historyService: AuditHistoryRecordService,
    public messageService: MessageService,
    public configService: IApplicationConfigurationManager,
    public localizationService: ILocalizationService,
    @Optional() private dialogConfig: DynamicDialogConfig
  ) {
    this.documentId = this.dialogConfig?.data?.documentId || this.documentId;
    this.documentObjectType = this.dialogConfig?.data?.documentType || this.documentObjectType;
    if (this.dialogConfig?.data?.onRecordSelected){
      this.onRecordSelected.subscribe(this.dialogConfig?.data?.onRecordSelected);
    }
  }

  ngOnInit(): void {
    this.loading = true;
  }

  loadRecords(event: LazyLoadEvent) {
    this.lastLazyLoadEvent = event;
    this.loading = true;
    const sortOrder: string = event.sortOrder > 0 ? 'asc' : 'desc';
    const sortField: string = event.sortField || 'id';
    const sorting: string = event.sortField ? sortField + ' ' + sortOrder : 'creationtime';

    if (this.disableLoading) return;
    if (!this.documentObjectType || !this.documentId) return;

    this.historyService
      .getDocumentHistoryByRequest({
        maxResultCount: this.rows,
        skipCount: event.first,
        sorting,
        documentObjectType: this.documentObjectType,
        documentId: this.documentId,
      })
      .pipe(first())
      .subscribe(response => {
        this.records = response.items;
        this.totalRecords = response.totalCount;
        this.loading = false;
      });
  }

  selectRecord(record: DocumentVersionEntity) {
    this.onRecordSelected.emit(record);
  }

  reloadRecords() {
    if (this.lastLazyLoadEvent) this.loadRecords(this.lastLazyLoadEvent);
  }
}
