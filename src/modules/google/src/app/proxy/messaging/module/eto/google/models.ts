import type { RouteShipmentTypeRequirementMode } from './route-shipment-type-requirement-mode.enum';

export interface RoutePointLatLngDto {
  latitude: number;
  longitude: number;
}

export interface RouteShipmentDto {
  shipmentType?: string;
  label?: string;
  pickups: RouteVisitRequestDto[];
  deliveries: RouteVisitRequestDto[];
}

export interface RouteShipmentTypeRequirementDto {
  dependentShipmentTypes: string[];
  requiredShipmentTypeAlternatives: string[];
  requirementMode: RouteShipmentTypeRequirementMode;
}

export interface RouteVehicleDto {
  label?: string;
  fixedCost: number;
}

export interface RouteVisitDurationDto {
  seconds: number;
}

export interface RouteVisitRequestDto {
  arrivalLocation: RoutePointLatLngDto;
  duration: RouteVisitDurationDto;
}
