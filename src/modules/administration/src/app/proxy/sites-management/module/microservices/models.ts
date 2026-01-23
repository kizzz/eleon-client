import type { ClientApplicationPropertyDto } from '../client-applications/models';

export interface ApplicationModuleDto {
  id?: string;
  url?: string;
  name?: string;
  pluginName?: string;
  parentId?: string;
  loadLevel?: string;
  orderIndex: number;
  expose?: string;
  properties: ClientApplicationPropertyDto[];
  clientApplicationEntityId?: string;
}
