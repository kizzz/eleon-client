
export interface CreateQueueRequestDto {
  name?: string;
  displayName?: string;
  messagesLimit: number;
  forwarding?: string;
}

export interface QueueDto {
  id?: string;
  name?: string;
  tenantId?: string;
  count: number;
  messagesLimit: number;
  displayName?: string;
  forwarding?: string;
}

export interface UpdateQueueRequestDto {
  name?: string;
  newName?: string;
  displayName?: string;
  forwarding?: string;
  messagesLimit: number;
}
