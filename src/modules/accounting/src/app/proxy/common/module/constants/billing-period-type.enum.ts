
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


export enum BillingPeriodType {
  Month = 0,
  Year = 1,
  Weekly = 2,
  Quarterly = 3,
  None = 4,
}

export const billingPeriodTypeOptions = mapEnumToOptions(BillingPeriodType);
