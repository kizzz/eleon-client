
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


export enum VportalApplicationType {
  Undefined = 0,
  AuthServer = 1,
  HostServer = 2,
  HostClient = 3,
  DriverClient = 4,
  ProxyClient = 5,
}

export const vportalApplicationTypeOptions = mapEnumToOptions(VportalApplicationType);
