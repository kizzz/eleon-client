
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


export enum LifecycleActorTypes {
  Initiator = 0,
  User = 1,
  Role = 2,
  Beneficiary = 3,
}

export const lifecycleActorTypesOptions = mapEnumToOptions(LifecycleActorTypes);
