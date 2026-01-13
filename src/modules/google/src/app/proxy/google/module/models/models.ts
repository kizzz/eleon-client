
export interface DirectionsPath {
  path: LatLng[];
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  distanceKilometers: number;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}
