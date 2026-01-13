import { EleoncoreApplicationConfigurationService } from './module-collector/sites-management/module/sites-management/module/http-api/controllers/eleoncore-application-configuration.service';
import { ApplicationConnectionStringService } from './sites-management/module/controllers/application-connection-string.service';
import { ApplicationMenuItemService } from './sites-management/module/controllers/application-menu-item.service';
import { ClientApplicationService } from './sites-management/module/controllers/client-application.service';
import { ClientAutodetectService } from './sites-management/module/controllers/client-autodetect.service';
import { CustomFeaturesService } from './sites-management/module/controllers/custom-features.service';
import { CustomPermissionsService } from './sites-management/module/controllers/custom-permissions.service';
import { MicroserviceService } from './sites-management/module/controllers/microservice.service';
import { ResourceService } from './sites-management/module/controllers/resource.service';
import { ServersideAutodetectService } from './sites-management/module/controllers/serverside-autodetect.service';
import { UiModuleService } from './sites-management/module/controllers/ui-module.service';

export const PROXY_SERVICES = [EleoncoreApplicationConfigurationService, ApplicationConnectionStringService, ApplicationMenuItemService, ClientApplicationService, ClientAutodetectService, CustomFeaturesService, CustomPermissionsService, MicroserviceService, ResourceService, ServersideAutodetectService, UiModuleService];