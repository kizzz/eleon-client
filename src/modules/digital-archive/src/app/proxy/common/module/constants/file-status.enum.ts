
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


export enum FileStatus {
  Trash = 0,
  Scanning = 1,
  Parsing = 2,
  Indexing = 3,
  Active = 4,
  Archived = 5,
}

export const fileStatusOptions = mapEnumToOptions(FileStatus);
