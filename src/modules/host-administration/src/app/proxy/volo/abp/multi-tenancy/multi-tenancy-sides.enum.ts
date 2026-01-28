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

export enum MultiTenancySides {
  Tenant = 1,
  Host = 2,
  Both = 3,
}

export const multiTenancySidesOptions = mapEnumToOptions(MultiTenancySides);
