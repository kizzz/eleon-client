import type { TimePeriodType } from '../../../common/module/constants/time-period-type.enum';
import type { TimeUnit } from '../../../common/module/constants/time-unit.enum';

export interface TriggerDto {
  id?: string;
  name?: string;
  isEnabled: boolean;
  startUtc?: string;
  nextRunUtc?: string;
  expireUtc?: string;
  periodType: TimePeriodType;
  period: number;
  repeatTask: boolean;
  repeatIntervalUnits: number;
  repeatIntervalUnitType: TimeUnit;
  repeatDurationUnits?: number;
  repeatDurationUnitType: TimeUnit;
  daysOfWeekList: number[];
  daysOfWeekOccurencesList: number[];
  daysOfWeekOccurencesLast: boolean;
  daysOfMonthList: number[];
  daysOfMonthLast: boolean;
  monthsList: number[];
  taskId?: string;
}

export interface TriggerListRequestDto {
  isEnabledFilter?: boolean;
  taskId?: string;
}
