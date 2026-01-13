import { FileShareStatus } from '@eleon/file-manager-proxy';

export const fileShareSeverities = {
    [FileShareStatus.Readonly]: 'primary',
    [FileShareStatus.Comment]: 'warning',
    [FileShareStatus.Modify]: 'success',
}
