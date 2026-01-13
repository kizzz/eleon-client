import { ILocalizationService, ITemplatingDialogService } from '@eleon/angular-sdk.lib';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionDto, TextFormat, textFormatOptions } from '@eleon/job-scheduler-proxy';
import { ActionService } from '@eleon/job-scheduler-proxy';
import { TimePeriodType } from '@eleon/job-scheduler-proxy';
import { Observable, of, PartialObserver } from 'rxjs';
import { finalize, mergeAll, mergeMap, tap } from 'rxjs/operators';
import {
  LocalizedConfirmationService,
  LocalizedMessageService,
  PageStateService,
} from '@eleon/primeng-ui.lib';
import {
  contributeControls,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { handleError } from '@eleon/angular-sdk.lib';

interface LocalizedValue {
  name: string;
  value: number;
}

interface Action {
  data: ActionDto;
  displayName: string;
  eventName: string;
  paramsFormat: TextFormat;
  actionParams: string;
  actionExtraParams: string;
  restartAfterFailSet: boolean;
  retryInterval: number;
  maxRetryAttempts: number;
  parentActions: { id: string; name: string }[];
  hasMaxDelay: boolean;
  maxDelay: number;
  onFailureRecipients: string[];
  validators: {
    displayNameEmpty: boolean;
  };
}

const LAST = -1;

@Component({
  standalone: false,
  selector: 'app-action-settings',
  templateUrl: './action-settings.component.html',
  styleUrls: ['./action-settings.component.scss'],
})
export class ActionSettingsComponent implements OnInit, OnChanges {
  header: Action;
  title: string;
  loadingAction: boolean = false;
  intervals: LocalizedValue[] = [];
  newRecipient = '';

  actions: ActionDto[] = [];
  isEditingActions = false;
  loading: boolean = false;

  public readonly textFormatOptions = textFormatOptions.filter(opt => opt.value !== TextFormat.Scriban).map((opt) => ({
    label: this.localizationService.instant(opt.key),
    value: opt.value,
  }));

  private _editedId: string;
  public get editedId(): string {
    return this._editedId;
  }

  public set editedId(value: string) {
    this._editedId = value;
    this.loadAction();
  }

  @Input()
  editing: boolean = false;

  @Input()
  public taskId: string;

  constructor(
    public localizationService: ILocalizationService,
    public actionsService: ActionService,
    public confirmationService: LocalizedConfirmationService,
    public messageService: LocalizedMessageService,
    public router: Router,
    public route: ActivatedRoute,
    private templatingDialog: ITemplatingDialogService,
    public pageStateService: PageStateService
  ) {}

  ngOnInit(): void {
    this.initAction();
    this.initIntervals();
  }

  initIntervals(): void {
    this.intervals = [
      {
        name: this.localizationService.instant(`JobScheduler::5Minutes`),
        value: 5 * 60,
      },
      {
        name: this.localizationService.instant(`JobScheduler::10Minutes`),
        value: 10 * 60,
      },
      {
        name: this.localizationService.instant(`JobScheduler::15Minutes`),
        value: 15 * 60,
      },
      {
        name: this.localizationService.instant(`JobScheduler::30Minutes`),
        value: 30 * 60,
      },
      {
        name: this.localizationService.instant(`JobScheduler::1Hour`),
        value: 60 * 60,
      },
      {
        name: this.localizationService.instant(`JobScheduler::6Hours`),
        value: 6 * 60 * 60,
      },
      {
        name: this.localizationService.instant(`JobScheduler::12Hours`),
        value: 12 * 60 * 60,
      },
      {
        name: this.localizationService.instant(`JobScheduler::1Day`),
        value: 24 * 60 * 60,
      },
    ];
  }

  loadAction(): void {
    this.title = this.localizationService.instant(
      'JobScheduler::ActionsSettings:Title:New'
    );
    this.initAction();
    if (this.editedId && !this.isNewAction()) {
      this.actionsService.getById(this.editedId).subscribe({
        next: (action) => {
          this.initAction(action);
          this.title = this.localizationService.instant(
            'JobScheduler::ActionsSettings:Title:Edit',
            action.displayName
          );
        },
      });
    }
  }

  initAction(actionDto?: ActionDto): void {
    this.header = {
      data: {
        ...actionDto,
      },
      displayName: actionDto?.displayName || null,
      eventName: actionDto?.eventName || null,
      actionParams: actionDto?.actionParams || '',
      actionExtraParams: actionDto?.actionExtraParams || '',
      paramsFormat: actionDto?.paramsFormat === 0 ?  actionDto?.paramsFormat : TextFormat.Json,
      restartAfterFailSet:
        !!actionDto &&
        actionDto?.maxRetryAttempts != 0 &&
        actionDto?.retryInterval != 0,
      retryInterval: actionDto?.retryInterval || 5 * 60,
      maxRetryAttempts: actionDto?.maxRetryAttempts || 1,
      parentActions: (actionDto?.parentActionIds || []).map((id) => ({
        id,
        name: this.getParentName(id),
      })),
      maxDelay: (actionDto?.timeoutInMinutes || 5) * 60,
      hasMaxDelay: !!actionDto && (actionDto?.timeoutInMinutes || 0) > 0,
      onFailureRecipients:
        actionDto?.onFailureRecepients
          ?.split(';')
          ?.map((x) => x.trim())
          ?.filter((x) => !!x) || [],
      validators: {
        displayNameEmpty: false,
      },
    };

    this.initAvailableParents();
  }

  validateAction(): boolean {
    let errors: string[] = [];
    if (!this.header.displayName?.length) {
      this.header.validators.displayNameEmpty = true;
      errors.push('JobScheduler::Actions:Errors:NameEmpty');
    }

    if (this.header.paramsFormat === TextFormat.Json) {
      try {
        JSON.parse(this.header.actionParams);
      } catch {
        errors.push('JobScheduler::Actions:Errors:InvalidJson');
      }
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.error(err);
    }
    return false;
  }

  gatherData(): ActionDto {
    const valid = this.validateAction();
    if (!valid) return null;

    const dto: ActionDto = {
      ...this.header.data,
      id: this.editedId == 'new' ? undefined : this.editedId,
      taskId: this.taskId,
      displayName: this.header.displayName || this.header.data.displayName,
      eventName: this.header.eventName || this.header.data.eventName,
      actionParams: this.header.actionParams || this.header.data.actionParams,
      actionExtraParams:
        this.header.actionExtraParams || this.header.data.actionExtraParams,
      paramsFormat: this.header.paramsFormat,
      retryInterval:
        this.header.retryInterval || this.header.data.retryInterval || 0,
      maxRetryAttempts: this.header.restartAfterFailSet
        ? this.header.maxRetryAttempts || this.header.data.maxRetryAttempts || 0
        : 0,
      parentActionIds:
        this.header.parentActions?.map((pa) => pa.id) ||
        this.header.data.parentActionIds ||
        [],
      timeoutInMinutes: this.header.hasMaxDelay
        ? (this.header.maxDelay || 0) / 60
        : 0,
      onFailureRecepients:
        this.header.onFailureRecipients
          ?.filter((r) => r && r.length > 0)
          .join(';') || '',
    };

    return dto;
  }

  error(msg: string) {
    this.messageService.error(msg);
  }
  success(msg: string) {
    this.messageService.success(msg);
  }

  canAddRecipient(): boolean {
    return !!this.newRecipient?.trim();
  }

  addRecipient(): void {
    const value = this.newRecipient?.trim();
    if (!value) {
      return;
    }

    if (!this.header.onFailureRecipients.includes(value)) {
      this.header.onFailureRecipients = [...this.header.onFailureRecipients, value];
      this.pageStateService.setDirty();
    }

    this.newRecipient = '';
  }

  removeRecipient(recipient: string): void {
    this.header.onFailureRecipients = this.header.onFailureRecipients.filter(r => r !== recipient);
    this.pageStateService.setDirty();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskId']) {
      this.loadActions();
    }
  }

  loadActions(): void {
    if (!this.taskId) {
      return;
    }

    this.loading = true;
    this.actionsService
      .getList({
        taskId: this.taskId,
      })
      .pipe(
        finalize(() => (this.loading = false)),
        handleError((err) => this.messageService.error(err.message))
      )
      .subscribe((list) => {
        this.actions = list;
        this.loading = false;
      });
  }

  actionAdded() {
    this.loading = true;

    const data = this.gatherData();

    let obs: Observable<ActionDto> = null;
    if (this.isNewAction()) {
      obs = this.actionsService.add(data);
    } else {
      obs = this.actionsService.update(data);
    }

    obs
      .pipe(
        finalize(() => (this.loading = false)),
        handleError((err) => this.messageService.error(err.message))
      )
      .subscribe(() => {
        this.isEditingActions = false;
        this.loadActions();
        this.messageService.success('JobScheduler::Actions:SaveSuccess');
      });
  }

  openActionSettingDialog(id) {
    this.editedId = id;
    this.selectedParent = null;
    this.isEditingActions = true;
  }

  isNewAction(): boolean {
    return this.editedId === 'new';
  }

  deleteAction(id) {
    if (!id) {
      return;
    }

    this.confirmationService.confirm(
      'JobScheduler::Actions:DeleteConfirmation',
      () => {
        this.actionsService
          .delete(id)
          .pipe(
            finalize(() => (this.loading = false)),
            handleError((err) => this.messageService.error(err.message))
          )
          .subscribe(() => {
            this.loadActions();
            this.messageService.success('JobScheduler::Actions:DeleteSuccess');
          });
      }
    );
  }

  selectedParent: { name: string; id: string } = null;
  availableParents: { name: string; id: string }[] = [];

  getParentName(parentId: string): string {
    const parent =
      this.actions?.find((action) => action.id === parentId) ?? null;
    return parent
      ? parent.displayName
      : this.localizationService.instant(
          'JobScheduler::Actions:ParentAction:Unknown'
        );
  }

  addParent() {
    if (!this.selectedParent || !this.selectedParent?.id) {
      this.messageService.error(
        'JobScheduler::Actions:ParentAction:SelectParent'
      );
      return;
    }
    if (
      this.header.parentActions.some((pa) => pa.id === this.selectedParent.id)
    ) {
      this.messageService.error(
        'JobScheduler::Actions:ParentAction:AlreadyExists'
      );
      return;
    }

    this.header.parentActions.push(this.selectedParent);
    this.initAvailableParents();
    this.selectedParent = null;
  }

  removeParent(parentId: string): void {
    this.header.parentActions = this.header.parentActions.filter(
      (action) => action.id !== parentId
    );
    this.initAvailableParents();
  }

  getParentsString(row: ActionDto) {
    return row.parentActionIds.map((id) => this.getParentName(id)).join(' ');
  }

  initAvailableParents() {
    this.availableParents =
      this.actions
        ?.filter(
          (action) =>
            this.header.data.id !== action.id &&
            this.header.parentActions.every((pa) => pa.id !== action.id)
        )
        ?.map((x) => ({ name: x.displayName, id: x.id })) ?? [];
  }

  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }

  openTemplateDialog(): void {
    this.templatingDialog.openTemplateChosingDialog((template) => {
      if (!template) {
        return;
      }

      this.header.eventName = template.templateId ?? this.header.eventName;

      if (template.templateContent) {
        this.header.actionParams = template.templateContent;
      }
    });
  }

}
