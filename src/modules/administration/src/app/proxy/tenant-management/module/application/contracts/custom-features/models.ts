import type { CustomFeatureDto, CustomFeatureGroupDto } from '../../../custom-features/models';

export interface CustomFeatureForMicroserviceDto {
  sourceId?: string;
  groups: CustomFeatureGroupDto[];
  features: CustomFeatureDto[];
}
