import { GoogleRoutesService } from './module-collector/google/module/google/module/http-api/controllers/google-routes.service';
import { GoogleDirectionsService } from './google/module/controllers/google-directions.service';
import { GoogleGeocodingService } from './google/module/controllers/google-geocoding.service';

export const PROXY_SERVICES = [GoogleRoutesService, GoogleDirectionsService, GoogleGeocodingService];