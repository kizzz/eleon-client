
export interface ControlDelegationDto {
  id?: string;
  userId?: string;
  delegatedToUserId?: string;
  delegationStartDate?: string;
  delegationEndDate?: string;
  active: boolean;
  reason?: string;
  userName?: string;
  delegatedToUserName?: string;
  lastLoginDate?: string;
  delegationHistory: ControlDelegationHistoryDto[];
}

export interface ControlDelegationHistoryDto {
  userId?: string;
  userName?: string;
  date?: string;
}

export interface CreateControlDelegationRequestDto {
  delegatedToUserId?: string;
  delegationStartDate?: string;
  delegationEndDate?: string;
  reason?: string;
}

export interface UpdateControlDelegationRequestDto {
  delegationId?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
}
