
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


export enum ExternalLinkLoginType {
  None = 0,
  Sms = 1,
  Email = 2,
  Password = 3,
}

export const externalLinkLoginTypeOptions = mapEnumToOptions(ExternalLinkLoginType);
