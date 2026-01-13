import { FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { EntryKind } from '@eleon/file-manager-proxy';

/**
 * Type guard to check if an entry is a file
 */
export function isFile(entry: FileSystemEntryDto | null | undefined): entry is FileSystemEntryDto & { entryKind: EntryKind.File } {
  return entry !== null && entry !== undefined && entry.entryKind === EntryKind.File;
}

/**
 * Type guard to check if an entry is a folder
 */
export function isFolder(entry: FileSystemEntryDto | null | undefined): entry is FileSystemEntryDto & { entryKind: EntryKind.Folder } {
  return entry !== null && entry !== undefined && entry.entryKind === EntryKind.Folder;
}

/**
 * Get the display name for an entry, handling file extensions appropriately
 */
export function getEntryDisplayName(entry: FileSystemEntryDto | null | undefined): string {
  if (!entry?.name) {
    return '';
  }
  return entry.name;
}

/**
 * Get the icon class for a file entry based on its extension
 */
export function getFileIcon(entry: FileSystemEntryDto): string {
  if (!entry?.name || !entry?.id) {
    return 'far fa-file';
  }

  const type = entry.name.split('.').pop()?.toLowerCase();
  if (!type || type.length === 0) {
    return 'far fa-file';
  }

  switch (type) {
    case 'doc':
    case 'docx':
      return 'far fa-file-word';
    case 'ppt':
    case 'pptx':
      return 'far fa-file-powerpoint';
    case 'xls':
    case 'xlsx':
      return 'far fa-file-excel';
    case 'jpg':
    case 'png':
    case 'jpeg':
    case 'gif':
    case 'tiff':
    case 'psd':
    case 'bmp':
    case 'webp':
    case 'raw':
    case 'heif':
    case 'indd':
    case 'svg':
    case 'ai':
    case 'eps':
      return 'far fa-file-image';
    case '3gp':
    case 'aa':
    case 'aac':
    case 'aax':
    case 'act':
    case 'aiff':
    case 'alac':
    case 'amr':
    case 'ape':
    case 'au':
    case 'awb':
    case 'dss':
    case 'dvf':
    case 'flac':
    case 'gsm':
    case 'iklx':
    case 'ivs':
    case 'm4a':
    case 'm4b':
    case 'm4p':
    case 'mmf':
    case 'mp3':
    case 'mpc':
    case 'msv':
    case 'nmf':
    case 'ogg':
    case 'oga':
    case 'mogg':
    case 'opus':
    case 'org':
    case 'ra':
    case 'rm':
    case 'rf64':
    case 'sln':
    case 'tta':
    case 'voc':
    case 'vox':
    case 'wav':
    case 'wma':
    case 'wv':
    case 'webm':
      return 'far fa-file-audio';
    case 'flv':
    case 'vob':
    case 'ogv':
    case 'drc':
    case 'avi':
    case 'mts':
    case 'm2ts':
    case 'wmv':
    case 'yuv':
    case 'viv':
    case 'mp4':
    case 'm4p':
    case '3pg':
    case 'f4v':
    case 'f4a':
    case 'mkv':
      return 'far fa-file-video';
    case 'pdf':
      return 'far fa-file-pdf';
    case 'txt':
      return 'far fa-file-alt';
    case 'zip':
    case 'zipx':
    case '7z':
    case 'rar':
    case 'tar.gz':
      return 'far fa-file-archive';
    default:
      return 'far fa-file';
  }
}

/**
 * Get the icon class for an entry (file or folder)
 */
export function getEntryIcon(entry: FileSystemEntryDto | null | undefined): string {
  if (!entry) {
    return 'far fa-file';
  }

  if (isFolder(entry)) {
    return 'far fa-folder';
  }

  if (isFile(entry)) {
    return getFileIcon(entry);
  }

  return 'far fa-file';
}

