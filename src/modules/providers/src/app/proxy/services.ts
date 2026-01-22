import { StorageProvidersService } from './storage/module/controllers/storage-providers.service';
import { StorageProvidersTestService } from './storage/module/controllers/storage-providers-test.service';
import { StorageRemoteService } from './storage/remote/http-api/storage/storage-remote.service';

export const PROXY_SERVICES = [StorageProvidersService, StorageProvidersTestService, StorageRemoteService];