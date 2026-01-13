
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


export enum BackgroundJobStatus {
  New = 0,
  Executing = 1,
  Completed = 2,
  Errored = 3,
  Retring = 4,
  Cancelled = 5,
}

export const backgroundJobStatusOptions = mapEnumToOptions(BackgroundJobStatus);
