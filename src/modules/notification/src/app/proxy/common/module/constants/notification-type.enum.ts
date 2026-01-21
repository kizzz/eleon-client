
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


export enum NotificationType {
  Message = 0,
  Email = 1,
  System = 2,
  Push = 3,
  Social = 4,
  Sms = 5,
  TwoFactor = 6,
}

export const notificationTypeOptions = mapEnumToOptions(NotificationType);
