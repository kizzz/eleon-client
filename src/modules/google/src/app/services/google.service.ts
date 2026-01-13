import { GoogleDirectionsService } from '@eleon/google-proxy';
import { Injectable } from '@angular/core';
import { DirectionsPath, IGoogleService, LatLng } from '@eleon/angular-sdk.lib';
import { GoogleGeocodingService } from '@eleon/google-proxy';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GoogleService extends IGoogleService {
  constructor(
    private googleGeocodingService: GoogleGeocodingService,
    private googleDirectionsService: GoogleDirectionsService
  ) {
    super();
  }

  geocodeAddressesByAddresses(
    addresses: string[],
    config?: Partial<any>
  ): Observable<LatLng[]> {
    return this.googleGeocodingService.geocodeAddressesByAddresses(
      addresses,
      config
    );
  }
  getDirectionsByWaypoints(
    waypoints: LatLng[],
    config?: Partial<any>
  ): Observable<DirectionsPath> {
    return this.googleDirectionsService.getDirectionsByWaypoints(
      waypoints,
      config
    );
  }
}
