import { ApplicationConnectionStringService } from './sites-management/module/controllers/application-connection-string.service';
import { ApplicationMenuItemService } from './sites-management/module/controllers/application-menu-item.service';
import { ClientApplicationService } from './sites-management/module/controllers/client-application.service';
import { ClientAutodetectService } from './sites-management/module/controllers/client-autodetect.service';
import { LocationService } from './sites-management/module/controllers/location.service';
import { MicroserviceService } from './sites-management/module/controllers/microservice.service';
import { ResourceService } from './sites-management/module/controllers/resource.service';
import { ServersideAutodetectService } from './sites-management/module/controllers/serverside-autodetect.service';
import { UiModuleService } from './sites-management/module/controllers/ui-module.service';

export const PROXY_SERVICES = [ApplicationConnectionStringService, ApplicationMenuItemService, ClientApplicationService, ClientAutodetectService, LocationService, MicroserviceService, ResourceService, ServersideAutodetectService, UiModuleService];