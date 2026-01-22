
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


export enum ChatMessageType {
  None = 0,
  PlainText = 1,
  ChatCreated = 2,
  MembersAdded = 3,
  MembersKicked = 4,
  UserLeft = 5,
  Document = 6,
  ChatClosed = 7,
  ChatRenamed = 8,
  LocalizedText = 9,
  MemberJoined = 10,
}

export const chatMessageTypeOptions = mapEnumToOptions(ChatMessageType);
