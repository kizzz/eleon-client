
export interface DashboardSettingDto {
  id?: string;
  tenantId?: string;
  xCoordinate?: number;
  yCoordinate?: number;
  cols?: number;
  maxItemCols?: number;
  minItemCols?: number;
  rows?: number;
  maxItemRows?: number;
  minItemRows?: number;
  label?: string;
  template?: string;
  creationTime?: string;
  dragEnabled: boolean;
  resizeEnabled: boolean;
  compactEnabled: boolean;
  isDefault: boolean;
}
