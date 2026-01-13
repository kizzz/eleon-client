import { FileArchiveService } from './file-manager/module/controllers/file-archive.service';
import { FileArchiveFavouriteService } from './file-manager/module/controllers/file-archive-favourite.service';
import { FileArchivePermissionService } from './file-manager/module/controllers/file-archive-permission.service';
import { FileService } from './file-manager/module/controllers/file.service';
import { FileExternalLinkService } from './file-manager/module/controllers/file-external-link.service';

export const PROXY_SERVICES = [FileArchiveService, FileArchiveFavouriteService, FileArchivePermissionService, FileService, FileExternalLinkService];