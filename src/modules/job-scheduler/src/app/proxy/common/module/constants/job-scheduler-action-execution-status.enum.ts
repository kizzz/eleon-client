
interface Option<T> {
  key: Extract<keyof T, string>;
  value: T[Extract<keyof T, string>];
}

function isNumber(value: string | number): boolean {
  return value == Number(value);
}


function mapEnumToOptions<T>(_enum: T): Option<T>[] {
  const options: Option<T>[] = [];

  for (const member in _enum)
    if (!isNumber(member))
      options.push({
        key: member,
        value: _enum[member],
      });

  return options;
}


export enum JobSchedulerActionExecutionStatus {
  NotStarted = 1,
  Executing = 3,
  Failed = 4,
  Completed = 5,
  Cancelled = 6,
}

export const jobSchedulerActionExecutionStatusOptions = mapEnumToOptions(JobSchedulerActionExecutionStatus);
