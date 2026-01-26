
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


export enum AccountListRequestType {
  Undefined = 0,
  EnRoute = 1,
  ActionRequired = 2,
  Archive = 3,
  Reseller = 4,
  ResellerByUser = 5,
  EnRouteAccountManager = 6,
  ActionRequiredAccountManager = 7,
  ArchiveAccountManager = 8,
}

export const accountListRequestTypeOptions = mapEnumToOptions(AccountListRequestType);
