
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


export enum LifecycleApprovalType {
  Regular = 0,
  Parallel = 1,
  AtLeast = 2,
}

export const lifecycleApprovalTypeOptions = mapEnumToOptions(LifecycleApprovalType);
