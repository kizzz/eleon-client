import type { LocationType } from './location-type.enum';

export interface Location {
  path?: string;
  type: LocationType;
  sourceUrl?: string;
  defaultRedirect?: string;
  resourceId?: string;
  isAuthorized: boolean;
  requiredPolicy?: string;
  subLocations: Location[];
}
