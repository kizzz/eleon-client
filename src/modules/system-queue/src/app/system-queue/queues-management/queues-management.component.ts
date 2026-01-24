// 
import { CommonModule } from "@angular/common"
import { Component, OnInit, ViewChild } from '@angular/core'
import {
  CreateQueueRequestDto,
  QueueDto,
  QueueService,
  UpdateQueueRequestDto,
} from '@eleon/event-management-proxy';
import { ErrorResponse, generateTempGuid, handleError, PipesModule, RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib'
import { LocalizedConfirmationService, LocalizedMessageService } from '@eleon/primeng-ui.lib'
import {
  contributeControls,
  PageControls,
} from '@eleon/primeng-ui.lib'
import { PageTitleModule } from "@eleon/primeng-ui.lib"
import { ResponsiveTableModule, SharedTableModule, TableCellsModule } from "@eleon/primeng-ui.lib"
import { ILocalizationService } from '@eleon/angular-sdk.lib';
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
import { QueueMessagesDialogComponent } from "./queue-messages-dialog/queue-messages-dialog.component";
import { ListboxModule } from 'primeng/listbox'
import { ChipModule } from 'primeng/chip'
import { TagModule } from 'primeng/tag'
import { ToastModule } from 'primeng/toast'

interface QueueDialogModel {
  data: {
		name: string,
		messagesLimit: number,
		displayName: string,
		forwarding: string[],
		forwardAll: boolean,
	},
  validators: {
    nameInvalid: boolean,
    limitInvalid: boolean 
  },
	forwardingInput: string,
  dialogTitle: string,
  queue: QueueDto | null,
}

interface QueueDtoExtended extends QueueDto{
  fillPercentage: number
}

const mapQueueToExtended = (queue: QueueDto) : QueueDtoExtended => {
  return {...queue, fillPercentage: queue.messagesLimit == 0 ? 0 : (queue.count / queue.messagesLimit) * 100};
}

@Component({
  selector: 'app-queues-management',
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
    QueueMessagesDialogComponent,
		ListboxModule,
		ChipModule,
		TagModule,
		ToastModule,
],
  templateUrl: './queues-management.component.html',
  styleUrls: ['./queues-management.component.css'],
})
export class QueuesManagementComponent implements OnInit {
  // root state
  loading: boolean = true;
  rowsCount: number = 15;
  totalRecords: number = 0;
  rows: QueueDtoExtended[] = [];
  lastLoadEvent: LazyLoadEvent | null = null;

  // editing
  dialogModel: QueueDialogModel | null = null;
  showDialog: boolean = false;

  constructor(
    private confirmationService: LocalizedConfirmationService,
    private messageService: LocalizedMessageService,
    private queuesService: QueueService,
		private localizationService: ILocalizationService
  ) {}

  @PageControls() controls = contributeControls([
    {
      key: 'EventManagementModule::Queues:Refresh',
      icon: 'fa fa-sync',
      severity: 'warning',
      show: () => true,
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.refresh(),
    },
		{
      key: 'EventManagementModule::Queues:Create',
      icon: 'fa fa-plus',
      severity: 'primary',
      show: () => true,
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.createQueue(),
    },
  ]);

  ngOnInit(): void {
    // this.refresh();
  }

  private refresh(){
    this.loadQueues(this.lastLoadEvent);
  }

  loadQueues(event: LazyLoadEvent | null){
    this.lastLoadEvent = event;
    this.loading = true;

    const sortField = event?.sortField || 'name';
    const sortOrder = event?.sortOrder == 1 ? 'asc' : 'desc';
    const sorting = sortField + " " + sortOrder;

    this.queuesService.getList({
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
        this.rows = res.items.map(q => mapQueueToExtended(q));
        this.totalRecords = res.totalCount;
      });
  }

  initDialogModel(){
    this.dialogModel = {
      data: {
        name: "",
        messagesLimit: 0,
				forwarding: [],
				forwardAll: false,
				displayName: "", 
      },
      validators: {
        nameInvalid: false,
        limitInvalid: false
      },
			forwardingInput: "",
      dialogTitle: this.localizationService.instant("EventManagementModule::Queue:Dialog:Add:Title"),
      queue: null
    }
  }
  resetValidators(){
    this.dialogModel.validators = {
      nameInvalid: false,
      limitInvalid: false
    }
  }
  saveQueue = () => {
    if (this.validate()){
      if (this.dialogModel.queue?.name){
				const updateQueue = () => {
					this.loading = true;
					this.queuesService.update({
					name: this.dialogModel.queue.name,
					newName: this.dialogModel.data.name,
					messagesLimit: this.dialogModel.data.messagesLimit,
					displayName: this.dialogModel.data.displayName,
					forwarding: this.dialogModel.data.forwardAll ? '*' : this.dialogModel.data.forwarding?.join(';') || '',
				})
          .pipe(
            finalize(() => this.loading = false),
            handleError((err) => {
							this.messageService.error(err.validationErrors[0] || err.message || "EventManagementModule::Queue:Update:Failed");
						}))
          .subscribe(res => {
            this.messageService.success("EventManagementModule::Queue:Update:Success");
            this.refresh();
            this.closeDialog();
          });
				}

				if (this.dialogModel.queue.count > this.dialogModel.data.messagesLimit){
					this.confirmationService.confirm("EventManagementModule::Queue:Update:Warning:NewLimitLessThanCount", updateQueue);
				}
				else{
					updateQueue();
				}
      }
      else{
				this.loading = true;
        this.queuesService.create({
					name: this.dialogModel.data.name,
					messagesLimit: this.dialogModel.data.messagesLimit,
					displayName: this.dialogModel.data.displayName,
					forwarding: this.dialogModel.data.forwardAll ? '*' : this.dialogModel.data.forwarding?.join(';') || '',
				})
          .pipe(
            finalize(() => this.loading = false),
            handleError(this.handleQueueSaveError))
          .subscribe(res => {
            this.messageService.success("EventManagementModule::Queue:Create:Success");
            this.refresh();
            this.closeDialog();
          });
      }
    }
  }


	handleQueueSaveError = (err: ErrorResponse) => {
		this.messageService.error(err.validationErrors[0] || err.message || "EventManagementModule::Queue:Update:Failed");
	}

  closeDialog(){
    this.showDialog = false;
    this.dialogModel = null;
  }

  validate(){
    let isValid = true;

    const data = this.dialogModel.data;

    if (!data){
      return false;
    }

    data.name = data.name.trim();

    if (!data.messagesLimit || data.messagesLimit < 100 || data.messagesLimit > 1000000){
      isValid = false;
      this.dialogModel.validators.limitInvalid = true;
      this.messageService.error("EventManagementModule::Queue:ValidationError:Limit:OutOfRange");
    }

    if (!data.name){
      isValid = false;
      this.dialogModel.validators.nameInvalid = true;
      this.messageService.error("EventManagementModule::Queue:ValidationError:Name:Invalid");
    }

    return isValid;
  }

	createQueue(){
		this.initDialogModel();
		this.showDialog = true;
	}

  editQueue(queue: QueueDto){
    if (queue) {
      this.initDialogModel();
      this.dialogModel.data = {
        name: queue.name,
        messagesLimit: queue.messagesLimit,
				displayName: queue.displayName,
				forwarding: queue.forwarding?.split(';').filter(x => x !== '' && x !== '*') || [],
				forwardAll: queue.forwarding === '*',
      }
      this.dialogModel.dialogTitle = this.localizationService.instant("EventManagementModule::Queue:Dialog:Edit:Title", queue.displayName || queue.name);
      this.dialogModel.queue = queue;
      this.showDialog = true;
    }
  }

  deleteQueue = (queue: QueueDto) => {
    this.confirmationService.confirm("EventManagementModule::Queue:Dialog:Delete:Title", () => {
      this.loading = true;
      this.queuesService.delete({ queueName: queue.name })
        .pipe(
          finalize(() => this.loading = false),
          catchError((error) => {
            this.messageService.error("EventManagementModule::Queue:Delete:Failed");
            return throwError(() => error);
          })
        )
        .subscribe(_ => {
          this.messageService.success("EventManagementModule::Queue:Delete:Success");
          this.refresh();
        });
    });
  }


  @ViewChild('queueDetailed') queueMessagesDialog!: QueueMessagesDialogComponent;
  showDetailedQueue(queue: QueueDto){
    this.queueMessagesDialog.show(queue);
  }

  onQueueCleared(queue: QueueDto){
    const index = this.rows.findIndex(r => r.id === queue.id);
    if (index === -1){ return; }

    const limit = queue.messagesLimit ?? this.rows[index].messagesLimit;
    const updatedCount = queue.count ?? 0;
    const updated: QueueDtoExtended = {
      ...this.rows[index],
      count: updatedCount,
      messagesLimit: limit,
      fillPercentage: limit === 0 ? 0 : (updatedCount / limit) * 100,
    };

    this.rows = [
      ...this.rows.slice(0, index),
      updated,
      ...this.rows.slice(index + 1),
    ];
  }

  getColor(fillPercentage: number): string {
    if (fillPercentage >= 100) {
      return 'var(--danger-color)';
    } else if (fillPercentage >= 80) {
      return 'var(--yellow-500)';
    }
    return 'var(--green-500)';
  }

	getLocalizedLimitHelpMessage(isSystem: boolean){
    return this.localizationService.instant("EventManagementModule::QueueDefinition:LimitRulesInfo", '0', isSystem ? '1000' : '100', `1 000 000`);
  }

	addForwarding(){
		this.dialogModel.forwardingInput = this.dialogModel.forwardingInput?.trim();

		if (!this.dialogModel.forwardingInput){
			this.messageService.error("EventManagementModule::Queue:Forwarding:Empty");
			return;
		}

		if (this.dialogModel.data.forwarding.includes(this.dialogModel.forwardingInput)){
			this.messageService.error("EventManagementModule::Queue:Forwarding:AlreadyExists");
			return;
		}

		if (!/^[a-zA-Z0-9_:]+$/.test(this.dialogModel.forwardingInput)){
			return this.messageService.error("EventManagementModule::QueueDefinition:ValidationError:Forwarding:Invalid");
		}

		this.dialogModel.data.forwarding.push(this.dialogModel.forwardingInput);
		this.dialogModel.forwardingInput = '';
	}

	removeMessageForwarding(message: string){
		this.dialogModel.data.forwarding = this.dialogModel.data.forwarding.filter(f => f !== message);
	}

	toggleForwardAll(){
		this.dialogModel.data.forwardAll = !this.dialogModel.data.forwardAll;
		// if (this.dialogModel.data.forwardAll) {
		// 	this.dialogModel.data.forwarding = ['*'];
		// } else {
		// 	this.dialogModel.data.forwarding = this.dialogModel.queue.forwarding.split(';').filter(x => x.trim() !== '');
		// }
	}
}
