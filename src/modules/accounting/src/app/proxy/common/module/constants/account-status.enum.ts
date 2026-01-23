
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


export enum AccountStatus {
  New = 0,
  Generating = 1,
  Active = 2,
  Suspended = 3,
  Canceled = 4,
  Deleted = 5,
  InActive = 6,
}

export const accountStatusOptions = mapEnumToOptions(AccountStatus);
