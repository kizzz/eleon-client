
interface Option<T> {
  key: Extract<keyof T, string>;
  value: T[Extract<keyof T, string>];
}

function isNumber(value: string | number): boolean {
  return value == Number(value);
}


function mapEnumToOptions<T>(_enum: T): Option<T>[] {
  const options: Option<T>[] = [];

  for (const member in _enum)
    if (!isNumber(member))
      options.push({
        key: member,
        value: _enum[member],
      });

  return options;
}


export enum RouteShipmentTypeRequirementMode {
  Unspecified = 0,
  PerformedBySameVehicle = 1,
  InSameVehicleAtPickupTime = 2,
  InSameVehicleAtDeliveryTime = 3,
}

export const routeShipmentTypeRequirementModeOptions = mapEnumToOptions(RouteShipmentTypeRequirementMode);
