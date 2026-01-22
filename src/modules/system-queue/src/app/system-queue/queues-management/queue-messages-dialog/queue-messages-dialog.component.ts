import { ILocalizationService } from '@eleon/angular-sdk.lib';

import { CommonModule } from "@angular/common"
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import {
  EventDto,
  EventService,
  QueueDto,
  QueueService,
} from '@eleon/event-management-proxy';
import { generateTempGuid, PipesModule, RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib'
import { LocalizedConfirmationService, LocalizedMessageService } from '@eleon/primeng-ui.lib'
import {
  contributeControls,
  PageControls,
} from '@eleon/primeng-ui.lib'
import { PageTitleModule } from "@eleon/primeng-ui.lib"
import { ResponsiveTableModule, SharedTableModule, TableCellsModule } from "@eleon/primeng-ui.lib"
import { LazyLoadEvent, TreeNode } from 'primeng/api'
import { ButtonModule } from "primeng/button"
import { CheckboxModule } from 'primeng/checkbox'
import { DialogModule } from "primeng/dialog"
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from "primeng/inputtext"
import { MultiSelectModule } from "primeng/multiselect"
import { ProgressBarModule } from 'primeng/progressbar'
import { RadioButtonModule } from "primeng/radiobutton"
import { TableModule } from "primeng/table"
import { TooltipModule } from "primeng/tooltip"
import { TreeModule, TreeNodeSelectEvent } from 'primeng/tree'
import { TreeTableModule } from 'primeng/treetable'
import { catchError, finalize, throwError } from 'rxjs'
import moment from 'moment'

@Component({
  selector: 'app-queue-messages-dialog',
  standalone: true,
  imports: [
      CommonModule,
      SharedModule,
      TableModule,
      ButtonModule,
      PageTitleModule,
      ResponsiveTableModule,
      RadioButtonModule,
      InputTextModule,
      MultiSelectModule,
      DialogModule,
      TooltipModule,
      TableCellsModule,
      SharedTableModule,
      PipesModule,
      RequiredMarkModule,
      TreeTableModule,
      InputGroupAddonModule,
      InputGroupModule,
      ProgressBarModule,
      InputNumberModule,
      TreeModule,
      CheckboxModule, 
    ],
  templateUrl: './queue-messages-dialog.component.html',
  styleUrls: ['./queue-messages-dialog.component.css'],
})
export class QueueMessagesDialogComponent implements OnInit {
  // root state
  dialogTitle: string = 'EventManagementModule::Queue:DetailedDialog:Title'
  loading: boolean = true;
showDialog: boolean = false;
  lastLoadEvent: LazyLoadEvent | null = null;
  
  rowsCount: number = 8;
  totalRecords: number = 0;
  
  data: QueueDto | null = null;
  rows: EventDto[] = [];

  @Output() cleared = new EventEmitter<QueueDto>();

  constructor(
    private confirmationService: LocalizedConfirmationService,
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private queuesService: QueueService,
    private eventsService: EventService
  ) {}

  ngOnInit(): void {
    
  }

  public show(queue: QueueDto){
    this.data = queue;
    this.dialogTitle = this.localizationService.instant('EventManagementModule::Queue:DetailedDialog:Title', queue.name);
    this.refresh();
    this.showDialog = true;
  }

  public hide(){
    this.showDialog = false;
  }

  refresh(){
    this.loadMessages(this.lastLoadEvent);
  }

  loadMessages(event: LazyLoadEvent | null){
    if (this.data.id === '00000000-0000-0000-0000-000000000000'){
      this.rows = [];
      this.totalRecords = 0;
      this.loading = false;
      return;
    }

    this.lastLoadEvent = event;
    this.loading = true;

    const sortField = event?.sortField || 'creationTime';
    const sortOrder = event?.sortOrder == 1 ? 'asc' : 'desc';
    const sorting = sortField + " " + sortOrder;

    this.eventsService.getList({
        queueId: this.data.id,
        maxResultCount: this.rowsCount,
        skipCount: event?.first ?? 0,
        sorting,
    })
      .pipe(
        finalize(() => this.loading = false),
        catchError((error) => {
          return throwError(() => error);
        })
      )
      .subscribe(res => {
        this.rows = res.items;
        this.totalRecords = res.totalCount;
      });
  }

  clearMessages(){
    if (!this.data || this.data.id === '00000000-0000-0000-0000-000000000000'){ return; }
    this.confirmationService.confirm('EventManagementModule::Queue:ClearMessages', () => {
      this.loading = true;
      this.queuesService.clear( { queueName:  this.data.name })
        .pipe(
          finalize(() => this.loading = false),
          catchError((error) => {
            this.messageService.error("EventManagementModule::Queue:Events:Clear:Failed");
            return throwError(() => error);
          }))
        .subscribe(_ => {
          this.messageService.success("EventManagementModule::Queue:Events:Clear:Success")
          this.rows = [];
          this.totalRecords = 0;
          this.data = this.data ? { ...this.data, count: 0 } : null;
          if (this.data) {
            this.cleared.emit(this.data);
          }
        }
        );
    })
  }

  getColor(count: number, limit: number): string {
    if (limit === 0) {
      return 'var(--green-500)';
    }
    const percentage = (count / limit) * 100;
    if (count === limit) {
      return 'var(--danger-color)';
    } else if (percentage >= 80) {
      return 'var(--yellow-500)';
    }
    return 'var(--green-500)';
  }

	downloadMessage(message: EventDto) {
		this.eventsService.downloadMessage(message.id)
			.pipe(
				catchError((error) => {
					this.messageService.error("EventManagementModule::Queue:Events:Download:Failed");
					return throwError(() => error);
				})
			)
			.subscribe(message => {
				const blob = new Blob([message.message || ''], { type: "text/plain;charset=utf-8" });

				const url = window.URL.createObjectURL(blob as any);
				const a = document.createElement('a');
				a.href = url;
				a.download = message.name + '_' + moment(message.creationTime).format('YYYYMMDD_HHmmss') + '.txt';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			});
	}
}
