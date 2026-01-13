
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


export enum PaymentType {
  Unknown = 0,
  Electron = 1,
  Credit = 2,
  CounterOffer = 3,
  Cash = 4,
  Advance = 5,
}

export const paymentTypeOptions = mapEnumToOptions(PaymentType);
