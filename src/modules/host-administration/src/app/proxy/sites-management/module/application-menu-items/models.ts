import type { MenuType } from '../consts/menu-type.enum';
import type { ItemType } from '../consts/item-type.enum';

export interface ApplicationMenuItemDto {
  id?: string;
  applicationId?: string;
  path?: string;
  isUrl: boolean;
  isNewWindow: boolean;
  label?: string;
  parentName?: string;
  icon?: string;
  order: number;
  requiredPolicy?: string;
  menuType: MenuType;
  itemType: ItemType;
  display: boolean;
}
