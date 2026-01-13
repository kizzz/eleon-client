
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


export enum EventBusStatus {
  Unknown = 0,
  Connected = 1,
  Initialization = 2,
  Error = 3,
  Disconnected = 4,
}

export const eventBusStatusOptions = mapEnumToOptions(EventBusStatus);
