
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


export enum InvoiceLineType {
  Recurring = 0,
  ProrationCredit = 1,
  ProrationCharge = 2,
  Usage = 3,
  OneTime = 4,
  Tax = 5,
  Discount = 6,
  Adjustment = 7,
}

export const invoiceLineTypeOptions = mapEnumToOptions(InvoiceLineType);
