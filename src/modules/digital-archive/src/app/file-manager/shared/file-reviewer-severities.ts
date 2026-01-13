import { LinkShareStatus } from '@eleon/file-manager-proxy';



export const fileReviewerSeverities = {
    [LinkShareStatus.Active]: 'success',
    [LinkShareStatus.Suspended]: 'warning',
    [LinkShareStatus.Canceled]: 'danger',
}
