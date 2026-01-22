
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


export enum StorageProviderSettingsTypes {
  ConstSetting = 0,
  String = 1,
  MultilineString = 2,
  Integer = 3,
  Decimal = 4,
  Boolean = 5,
}

export const storageProviderSettingsTypesOptions = mapEnumToOptions(StorageProviderSettingsTypes);
