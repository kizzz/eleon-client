import type { ApplicationAuthConfigurationDto, ApplicationFeatureConfigurationDto, ApplicationLocalizationConfigurationDto, CurrentUserDto } from '../../../../../../../../volo/abp/asp-net-core/mvc/application-configurations/models';
import type { CurrentTenantDto } from '../../../../../../../../volo/abp/asp-net-core/mvc/multi-tenancy/models';
import type { ClientApplicationDto } from '../../../../../../../../sites-management/module/client-applications/models';
import type { ApplicationModuleDto } from '../../../../../../../../sites-management/module/microservices/models';

export interface EleoncoreApplicationConfigurationDto {
  localization: ApplicationLocalizationConfigurationDto;
  auth: ApplicationAuthConfigurationDto;
  currentUser: CurrentUserDto;
  features: ApplicationFeatureConfigurationDto;
  currentTenant: CurrentTenantDto;
  extraProperties: Record<string, object>;
  production: boolean;
  applicationName?: string;
  applicationPath?: string;
  corePath?: string;
  authPath?: string;
  frameworkType?: string;
  styleType?: string;
  clientApplicationType?: string;
  clientApplication: ClientApplicationDto;
  modules: ApplicationModuleDto[];
  oAuthConfig: OAuthConfigDto;
  webPush: WebPushConfigDto;
}

export interface OAuthConfigDto {
  clientId?: string;
  responseType?: string;
  scope?: string;
  useSilentRefresh: boolean;
}

export interface WebPushConfigDto {
  publicKey?: string;
}
