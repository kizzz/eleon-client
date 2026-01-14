import { TimeUnit } from '@eleon/job-scheduler-proxy';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TriggerDto } from '@eleon/job-scheduler-proxy';
import { TriggerService } from '@eleon/job-scheduler-proxy';
import { TimePeriodType } from '@eleon/job-scheduler-proxy';
import { Observable, of, PartialObserver } from 'rxjs';
import { finalize, mergeAll, mergeMap, tap } from 'rxjs/operators';
import {
  LocalizedConfirmationService,
  LocalizedMessageService,
} from '@eleon/primeng-ui.lib';
import {
  contributeControls,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { handleError } from '@eleon/angular-sdk.lib';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
interface TimeUnitOption {
  name: string;
  value: number;
  disabled?: boolean;
}

interface Trigger {
  data: TriggerDto;
  name: string;
  startDate: Date;
  expireDate: Date;
  selectedPeriodType: TimeUnitOption;
  selectedDaysOfWeek: TimeUnitOption[];
  selectedMonths: TimeUnitOption[];
  selectedDaysOfMonth: TimeUnitOption[];
  selectedDaysOfWeekOccurence: TimeUnitOption[];
  expireSet: boolean;
  repeatSet: boolean;
  repeatIntervalUnits: number;
  repeatIntervalUnitType: TimeUnit;
  repeatDurationUnits: number;
  repeatDurationUnitType: TimeUnit;
  daysOrDaysOfWeek: 'days' | 'daysOfWeek';
  validators: {
    nameEmpty: boolean;
    startEmpty: boolean;
    expireEmpty: boolean;
    repeatDurationOutOfRange: boolean;
    repeatIntervalOutOfRange: boolean;
    periodEmpty: boolean;
    daysOfWeekEmpty: boolean;
    daysOfWeekOccurencesEmpty: boolean;
    daysOfMonthEmpty: boolean;
    monthsEmpty: boolean;
  };
}

const LAST = -1;

interface TriggerRow {
  data: TriggerDto;
  localizedPeriodType: string;
}

@Component({
  standalone: false,
  selector: 'app-trigger-settings',
  templateUrl: './trigger-settings.component.html',
  styleUrls: ['./trigger-settings.component.scss'],
})
export class TriggerSettingsComponent implements OnInit, OnChanges {
  header: Trigger;
  title: string;
  periodTypes: TimeUnitOption[];
  daysOfWeek: TimeUnitOption[];
  months: TimeUnitOption[];
  daysOfMonth: TimeUnitOption[];
  daysOfWeekOccurences: TimeUnitOption[];
  TimePeriodType = TimePeriodType;
  timeUnitTypeOptions = [
    {
      name: this.localizationService.instant('JobScheduler::Minutes'),
      value: TimeUnit.Minutes,
    },
    {
      name: this.localizationService.instant('JobScheduler::Hours'),
      value: TimeUnit.Hours,
    },
    {
      name: this.localizationService.instant('JobScheduler::Days'),
      value: TimeUnit.Days,
    },
  ];
  durationTimeUnitOptions: TimeUnitOption[] = [...this.timeUnitTypeOptions];
  private readonly orderedTimeUnits: TimeUnit[] = [
    TimeUnit.Minutes,
    TimeUnit.Hours,
    TimeUnit.Days,
  ];
  triggers: TriggerRow[];
  isEditingTriggers = false;
  loading = false;
  showNextRuntimesDialog = false;
  selectedTriggerIdForNextRuntimes: string;

  @Input()
  editing = false;

  private _editedId: string;
  public get editedId(): string {
    return this._editedId;
  }

  public set editedId(value: string) {
    this._editedId = value;
    this.loadTrigger();
  }

  @Input()
  public taskId: string;

  constructor(
    public localizationService: ILocalizationService,
    public triggersService: TriggerService,
    public confirmationService: LocalizedConfirmationService,
    public messageService: LocalizedMessageService,
    public router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initPeriodTypes();
    this.initDaysOfWeek();
    this.initMonths();
    this.initDaysOfMonth();
    this.initDaysOfWeekOccurences();
    this.initTrigger();
    this.loadTrigger();
  }

  initPeriodTypes(): void {
    this.periodTypes = Object.keys(TimePeriodType)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        value: TimePeriodType[name as keyof typeof TimePeriodType],
        name: this.localizationService.instant(
          `JobScheduler::PeriodType:${name}`
        ),
      }));
  }

  initDaysOfWeek(): void {
    this.daysOfWeek = [];
    for (let i = 1; i <= 7; i++) {
      this.daysOfWeek.push({
        name: this.localizationService.instant(
          `JobScheduler::Trigger:DayOfWeek:${i}`
        ),
        value: i,
      });
    }
  }

  initMonths(): void {
    this.months = [];
    for (let i = 1; i <= 12; i++) {
      this.months.push({
        name: this.localizationService.instant(
          `JobScheduler::Trigger:Month:${i}`
        ),
        value: i,
      });
    }
  }

  initDaysOfMonth(): void {
    this.daysOfMonth = [];
    for (let i = 1; i <= 31; i++) {
      this.daysOfMonth.push({
        name: i.toString(),
        value: i,
      });
    }
    this.daysOfMonth.push({
      name: this.localizationService.instant('JobScheduler::Last'),
      value: LAST,
    });
  }

  initDaysOfWeekOccurences(): void {
    this.daysOfWeekOccurences = [];
    for (let i = 1; i <= 4; i++) {
      this.daysOfWeekOccurences.push({
        name: this.localizationService.instant(
          `JobScheduler::Trigger:DayOfWeekOccurence:${i}`
        ),
        value: i,
      });
    }
    this.daysOfWeekOccurences.push({
      name: this.localizationService.instant('JobScheduler::Last'),
      value: LAST,
    });
  }

  loadTrigger(): void {
    if (this.editedId && this.editedId !== 'new') {
      this.triggersService.getById(this.editedId).subscribe({
        next: (trigger) => {
          this.initTrigger(trigger);
          this.title = this.localizationService.instant(
            'JobScheduler::TriggersSettings:Title:Edit',
            trigger.name
          );
        },
      });
    } else {
      this.title = this.localizationService.instant(
        'JobScheduler::TriggersSettings:Title:New'
      );
      this.initTrigger();
    }
  }

  initTrigger(triggerDto?: TriggerDto): void {
    this.header = {
      data: {
        ...triggerDto,
        isEnabled: !!triggerDto ? triggerDto.isEnabled : true,
        period: triggerDto?.period || 1,
      },
      name: triggerDto?.name || null,
      startDate: !!triggerDto?.startUtc ? this.fromUtcIgnoringOffset(triggerDto.startUtc) : null,
      expireDate: !!triggerDto?.expireUtc
        ? this.fromUtcIgnoringOffset(triggerDto.expireUtc)
        : null,
      expireSet: !!triggerDto?.expireUtc,
      repeatSet: !!triggerDto?.repeatDurationUnits,
      repeatIntervalUnits: triggerDto?.repeatIntervalUnits,
      repeatIntervalUnitType:
        triggerDto?.repeatIntervalUnitType || TimeUnit.Minutes,
      repeatDurationUnits: triggerDto?.repeatDurationUnits,
      repeatDurationUnitType:
        triggerDto?.repeatDurationUnitType || TimeUnit.Minutes,
      selectedPeriodType:
        this.periodTypes.find((x) => x.value === triggerDto?.periodType) ||
        this.periodTypes[0],
      selectedDaysOfWeek:
        triggerDto?.daysOfWeekList.map((x) => this.daysOfWeek[x - 1]) || [],
      selectedMonths:
        triggerDto?.monthsList.map((x) => this.months[x - 1]) || [],
      selectedDaysOfMonth:
        triggerDto?.daysOfMonthList.map((x) => this.daysOfMonth[x - 1]) || [],
      selectedDaysOfWeekOccurence:
        triggerDto?.daysOfWeekOccurencesList.map(
          (x) => this.daysOfWeekOccurences[x - 1]
        ) || [],
      daysOrDaysOfWeek:
        triggerDto?.daysOfWeekList?.length &&
        (triggerDto?.daysOfWeekOccurencesList?.length ||
          triggerDto?.daysOfWeekOccurencesLast)
          ? 'daysOfWeek'
          : 'days',
      validators: {
        nameEmpty: false,
        startEmpty: false,
        expireEmpty: false,
        repeatDurationOutOfRange: false,
        repeatIntervalOutOfRange: false,
        periodEmpty: false,
        daysOfWeekEmpty: false,
        daysOfWeekOccurencesEmpty: false,
        daysOfMonthEmpty: false,
        monthsEmpty: false,
      },
    };
    this.onIntervalUnitTypeChange();
    if (triggerDto?.daysOfMonthLast) {
      this.header.selectedDaysOfMonth.push(
        this.daysOfMonth.find((x) => x.value === LAST)
      );
    }
    if (triggerDto?.daysOfWeekOccurencesLast) {
      this.header.selectedDaysOfWeekOccurence.push(
        this.daysOfWeekOccurences.find((x) => x.value === LAST)
      );
    }
  }

  resetAllValidators(): void {
    this.resetNameValidators();
    this.resetStartValidators();
    this.resetExpireValidators();
    this.resetRepeatDurationValidators();
    this.resetRepeatIntervalValidators();
    this.resetPeriodValidators();
    this.resetDaysOfWeekValidators();
    this.resetDaysOfWeekOccurencesValidators();
    this.resetDaysOfMonthValidators();
    this.resetMonthsValidators();
  }

  resetNameValidators(): void {
    this.header.validators.nameEmpty = false;
  }

  resetStartValidators(): void {
    this.header.validators.startEmpty = false;
  }

  resetExpireValidators(): void {
    this.header.validators.expireEmpty = false;
  }

  resetRepeatDurationValidators(): void {
    this.header.validators.repeatDurationOutOfRange = false;
  }

  resetRepeatIntervalValidators(): void {
    this.header.validators.repeatIntervalOutOfRange = false;
  }

  resetPeriodValidators(): void {
    this.header.validators.periodEmpty = false;
  }

  resetDaysOfWeekValidators(): void {
    this.header.validators.daysOfWeekEmpty = false;
  }

  resetDaysOfWeekOccurencesValidators(): void {
    this.header.validators.daysOfWeekOccurencesEmpty = false;
  }

  resetDaysOfMonthValidators(): void {
    this.header.validators.daysOfMonthEmpty = false;
  }

  resetMonthsValidators(): void {
    this.header.validators.monthsEmpty = false;
  }

  validateTrigger(): boolean {
    this.resetAllValidators();
    const errors: string[] = [];
    if (!this.header.name?.length) {
      this.header.validators.nameEmpty = true;
      errors.push('JobScheduler::Triggers:Errors:NameEmpty');
    }

    if (!this.header.startDate) {
      this.header.validators.startEmpty = true;
      errors.push('JobScheduler::Triggers:Errors:StartEmpty');
    }

    if (this.header.expireSet && !this.header.expireDate) {
      this.header.validators.expireEmpty = true;
      errors.push('JobScheduler::Triggers:Errors:ExpireEmpty');
    }

    if (this.header.repeatSet) {
      if (!this.header.repeatIntervalUnits) {
        this.header.validators.repeatIntervalOutOfRange = true;
        errors.push('JobScheduler::Triggers:Errors:RepeatIntervalEmpty');
      }
      const intervalTime = this.gatherUnitTimes(
        this.header.repeatIntervalUnits,
        this.header.repeatIntervalUnitType
      );
      const durationTime = this.gatherUnitTimes(
        this.header.repeatDurationUnits,
        this.header.repeatDurationUnitType
      );

      if (intervalTime < 5 || intervalTime > 5256000) {
        this.header.validators.repeatIntervalOutOfRange = true;
        errors.push('JobScheduler::Triggers:Errors:RepeatIntervalOutOfRange');
      }

      if (durationTime !== null && durationTime < 5 || durationTime > 5256000) {
        this.header.validators.repeatDurationOutOfRange = true;
        errors.push('JobScheduler::Triggers:Errors:RepeatDurationOutOfRange');
      }

      if (durationTime !== null && intervalTime > durationTime) {
        this.header.validators.repeatIntervalOutOfRange = true;
        errors.push(
          'JobScheduler::Triggers:Errors:RepeatIntervalGreaterThanDuration'
        );
      }
    }

    switch (this.header.selectedPeriodType.value) {
      case TimePeriodType.Daily:
        if (!this.header.data.period) {
          this.header.validators.periodEmpty = true;
          errors.push('JobScheduler::Triggers:Errors:PeriodEmpty');
        }
        break;
      case TimePeriodType.Weekly:
        if (!this.header.data.period) {
          this.header.validators.periodEmpty = true;
          errors.push('JobScheduler::Triggers:Errors:PeriodEmpty');
        }

        if (!this.header.selectedDaysOfWeek?.length) {
          this.header.validators.daysOfWeekEmpty = true;
          errors.push('JobScheduler::Triggers:Errors:DaysOfWeekEmpty');
        }
        break;
      case TimePeriodType.Monthly:
        if (!this.header.selectedMonths?.length) {
          this.header.validators.monthsEmpty = true;
          errors.push('JobScheduler::Triggers:Errors:MonthsEmpty');
        }
        if (this.header.daysOrDaysOfWeek === 'days') {
          if (!this.header.selectedDaysOfMonth?.length) {
            this.header.validators.daysOfMonthEmpty = true;
            errors.push('JobScheduler::Triggers:Errors:DaysOfMonthEmpty');
          }
        } else if (this.header.daysOrDaysOfWeek === 'daysOfWeek') {
          if (!this.header.selectedDaysOfWeek?.length) {
            this.header.validators.daysOfWeekEmpty = true;
            errors.push('JobScheduler::Triggers:Errors:DaysOfWeekEmpty');
          }
          if (!this.header.selectedDaysOfWeekOccurence?.length) {
            this.header.validators.daysOfWeekOccurencesEmpty = true;
            errors.push(
              'JobScheduler::Triggers:Errors:DaysOfWeekOccurenceEmpty'
            );
          }
        }
        break;

      default:
        break;
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.error(err);
    }
    return false;
  }

  gatherData(): TriggerDto {
    const valid = this.validateTrigger();
    if (!valid) return null;

    const dto: TriggerDto = {
      ...this.header.data,
      id: this.editedId == 'new' ? undefined : this.editedId,
      taskId: this.taskId,
      name: this.header.name,
      period: undefined,
      daysOfWeekList: undefined,
      daysOfMonthList: undefined,
      daysOfWeekOccurencesList: undefined,
      daysOfWeekOccurencesLast: false,
      daysOfMonthLast: undefined,
      startUtc: this.toUtcEpoch(this.header.startDate)?.toISOString(),
      expireUtc: this.header.expireSet
        ? this.toUtcEpoch(this.header.expireDate)?.toISOString()
        : undefined,
      repeatTask: this.header.repeatSet,
      repeatDurationUnits: this.header.repeatSet
        ? this.header.repeatDurationUnits
        : undefined,
      repeatIntervalUnits: this.header.repeatSet
        ? this.header.repeatIntervalUnits
        : undefined,
      repeatDurationUnitType: this.header.repeatSet
        ? this.header.repeatDurationUnitType
        : undefined,
      repeatIntervalUnitType: this.header.repeatSet
        ? this.header.repeatIntervalUnitType
        : undefined,

      periodType: this.header.selectedPeriodType.value,
    };

    switch (this.header.selectedPeriodType.value) {
      case TimePeriodType.Daily:
        dto.period = this.header.data.period;
        break;
      case TimePeriodType.Weekly:
        dto.period = this.header.data.period;
        dto.daysOfWeekList = this.header.selectedDaysOfWeek.map((x) => x.value);
        break;
      case TimePeriodType.Monthly:
        dto.monthsList = this.header.selectedMonths.map((x) => x.value);
        if (this.header.daysOrDaysOfWeek === 'days') {
          dto.daysOfMonthList = this.header.selectedDaysOfMonth
            .map((x) => x.value)
            .filter((x) => x > 0);
          if (this.header.selectedDaysOfMonth.find((x) => x.value === LAST)) {
            dto.daysOfMonthLast = true;
          }
        } else if (this.header.daysOrDaysOfWeek === 'daysOfWeek') {
          dto.daysOfWeekList = this.header.selectedDaysOfWeek
            .map((x) => x.value)
            .filter((x) => x > 0);
          dto.daysOfWeekOccurencesList = this.header.selectedDaysOfWeekOccurence
            .map((x) => x.value)
            .filter((x) => x > 0);
          if (
            this.header.selectedDaysOfWeekOccurence.find(
              (x) => x.value === LAST
            )
          ) {
            dto.daysOfWeekOccurencesLast = true;
          }
        }
        break;
      default:
        break;
    }

    return dto;
  }

  private toUtcEpoch(d: Date | null | undefined): Date | undefined {
    if (!d) return undefined;
    return new Date(
      Date.UTC(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
        d.getMilliseconds()
      )
    ); // ms since epoch, UTC
  }

  error(msg: string) {
    this.messageService.error(msg);
  }
  success(msg: string) {
    this.messageService.success(msg);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskId']) {
      this.loadTriggers();
    }
  }

  loadTriggers(): void {
    if (!this.taskId) {
      return;
    }

    this.loading = true;
    this.triggersService
      .getList({
        isEnabledFilter: undefined,
        taskId: this.taskId,
      })
      .pipe(
        finalize(() => (this.loading = false)),
        handleError((err) => this.messageService.error(err.message))
      )
      .subscribe((list) => {
        this.triggers = list.map((x) => ({
          data: x,
          localizedPeriodType: this.localizationService.instant(
            `JobScheduler::PeriodType:${TimePeriodType[x.periodType]}`
          ),
        }));
        this.loading = false;
      });
  }

  triggerAdded() {
    this.loading = true;

    const data = this.gatherData();
    if (!data) {
      this.loading = false;
      return;
    }

    let obs: Observable<TriggerDto> = null;
    if (this.isNewTrigger()) {
      obs = this.triggersService.add(data);
    } else {
      obs = this.triggersService.update(data);
    }

    obs
      .pipe(
        finalize(() => (this.loading = false)),
        handleError((err) => this.messageService.error(err.message))
      )
      .subscribe(() => {
        this.isEditingTriggers = false;
        this.loadTriggers();
        this.messageService.success('JobScheduler::Triggers:SaveSuccess');
      });
  }

  openTriggerSettingDialog(id) {
    this.editedId = id;
    this.isEditingTriggers = true;
    this.loadTrigger();
  }

  isNewTrigger(): boolean {
    return this.editedId === 'new';
  }

  deleteTrigger(id) {
    if (!id) {
      return;
    }

    this.confirmationService.confirm(
      'JobScheduler::Triggers:DeleteConfirmation',
      () => {
        this.triggersService
          .delete(id)
          .pipe(
            finalize(() => (this.loading = false)),
            handleError((err) => this.messageService.error(err.message))
          )
          .subscribe(() => {
            this.loadTriggers();
            this.messageService.success('JobScheduler::Triggers:DeleteSuccess');
          });
      }
    );
  }

  toggleTriggerEnabled(id: string, isEnabled: boolean) {
    this.triggersService
      .setTriggerIsEnabled(id, isEnabled)
      .pipe(
        finalize(() => (this.loading = false)),
        handleError((err) => this.messageService.error(err.message))
      )
      .subscribe(() => {
        this.loadTriggers();
        this.messageService.success(
          'JobScheduler::Triggers:ToggleSuccess:' +
            (isEnabled ? 'Enabled' : 'Disabled')
        );
      });
  }

  private gatherUnitTimes(units: number, unitType: TimeUnit): number {
    switch (unitType) {
      case TimeUnit.Minutes:
        return units;
      case TimeUnit.Hours:
        return units * 60;
      case TimeUnit.Days:
        return units * 60 * 24;
      default:
        return units;
    }
  }
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }

  onIntervalUnitTypeChange(): void {
    const minIndex = this.orderedTimeUnits.indexOf(this.header.repeatIntervalUnitType);
    this.durationTimeUnitOptions = this.timeUnitTypeOptions.map((option) => ({
      ...option,
      disabled:
        minIndex >= 0 && this.orderedTimeUnits.indexOf(option.value) < minIndex,
    }));

    this.header.repeatDurationUnitType = this.ensureValidUnitSelection(
      this.header.repeatDurationUnitType,
      this.durationTimeUnitOptions
    );
  }

  private ensureValidUnitSelection(
    current: TimeUnit,
    options: TimeUnitOption[]
  ): TimeUnit {
    if (
      options.some((option) => option.value === current && !option.disabled)
    ) {
      return current;
    }

    const fallback = options.find((option) => !option.disabled);
    return fallback ? fallback.value : current;
  }

  resetExpireDate(): void {
    if (!this.header.expireSet) {
      this.header.expireDate = null;
    }
  }

  onPeriodTypeChanged(event: any): void {
    if (event.value === TimePeriodType.Daily || event.value === TimePeriodType.Weekly) {
      this.header.data.period = 1;
    }
    else {
      this.header.data.period = null;
    }
    this.header.selectedDaysOfWeek = [];
    this.header.selectedMonths = [];
    this.header.selectedDaysOfMonth = [];
    this.header.selectedDaysOfWeekOccurence = [];
  }

  onEditDialogClosed(): void {
    this.editedId = null;
    this.initTrigger();
  }

  openNextRuntimesDialog(triggerId: string): void {
    this.selectedTriggerIdForNextRuntimes = triggerId;
    this.showNextRuntimesDialog = true;
  }
  private fromUtcIgnoringOffset(value?: string | null): Date | null {
  if (!value) return null;

  const d = new Date(value);
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds()
  );
}
}
