import type { CustomFeatureDto, CustomFeatureGroupDto } from '../../../custom-features/models';

export interface CustomFeatureForMicroserviceDto {
  groups: CustomFeatureGroupDto[];
  features: CustomFeatureDto[];
}
