import type { SiteType } from './site-type.enum';

export interface Location {
  path?: string;
  type: SiteType;
  sourceUrl?: string;
  defaultRedirect?: string;
  resourceId?: string;
  isAuthorized: boolean;
  requiredPolicy?: string;
  subLocations: Location[];
}
