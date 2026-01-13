
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


export enum PackageModuleType {
  User = 0,
  Role = 1,
  OrgUnit = 2,
  Feature = 3,
  Service = 4,
}

export const packageModuleTypeOptions = mapEnumToOptions(PackageModuleType);
