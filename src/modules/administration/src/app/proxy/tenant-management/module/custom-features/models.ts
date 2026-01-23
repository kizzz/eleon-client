
export interface CustomFeatureDto {
  id?: string;
  groupName?: string;
  name?: string;
  parentName?: string;
  displayName?: string;
  description?: string;
  defaultValue?: string;
  isVisibleToClients: boolean;
  isAvailableToHost: boolean;
  allowedProviders?: string;
  valueType?: string;
  isDynamic: boolean;
}

export interface CustomFeatureGroupDto {
  id?: string;
  name?: string;
  displayName?: string;
  categoryName?: string;
  isDynamic: boolean;
}
