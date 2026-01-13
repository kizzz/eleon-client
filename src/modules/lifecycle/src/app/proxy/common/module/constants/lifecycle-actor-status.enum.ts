
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


export enum LifecycleActorStatus {
  Enroute = 0,
  Reviewed = 1,
  Approved = 2,
  Rejected = 3,
  Canceled = 4,
}

export const lifecycleActorStatusOptions = mapEnumToOptions(LifecycleActorStatus);
