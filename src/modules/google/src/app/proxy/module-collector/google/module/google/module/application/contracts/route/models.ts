import type { RouteShipmentDto, RouteShipmentTypeRequirementDto, RouteVehicleDto } from '../../../../../../../../messaging/module/eto/google/models';

export interface OptimizeToursRequestDto {
  shipments: RouteShipmentDto[];
  vehicles: RouteVehicleDto[];
  shipmentTypeRequirements: RouteShipmentTypeRequirementDto[];
  globalStartTime?: string;
  globalEndTime?: string;
}

export interface OptimizedToursDto {
  skippedShipmentLabels: string[];
  routes: RouteDto[];
}

export interface RouteDto {
  vehicleLabel?: string;
  routeVisitsShipmentLabels: string[];
}
