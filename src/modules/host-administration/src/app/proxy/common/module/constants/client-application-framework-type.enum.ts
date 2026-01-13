
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


export enum ClientApplicationFrameworkType {
  None = 0,
  Angular = 1,
  React = 2,
  CustomAngular = 3,
  VirtualDirectory = 4,
}

export const clientApplicationFrameworkTypeOptions = mapEnumToOptions(ClientApplicationFrameworkType);
