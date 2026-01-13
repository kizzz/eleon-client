import { Injectable } from "@angular/core";
import { LightweightStorageItemService } from '@eleon/storage-proxy';
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { Subject, bufferTime, firstValueFrom } from "rxjs";
import { ILightweightStorageService } from '@eleon/contracts.lib';
import { db, getOrAddCacheItem, LightweightStorageCacheItem } from '@eleon/angular-sdk.lib'

interface FileResponse {
  fileKey: string;
  fileData: string;
}

@Injectable({
  providedIn: "root",
})
export class CachedLightweightStorageService extends ILightweightStorageService {
  public requests$ = new Subject<string>();
  public responses$ = new Subject<FileResponse[]>();

  private fileHelper = new FileHelperService();

  // Create a queue handler that will compose requests made each .5 seconds into single request.
  public requestHandler = this.requests$
    .pipe(bufferTime(500))
    .subscribe(async (fileKeys) => {
      if (!fileKeys?.length) {
        return;
      }


      const distinctKeys = Array.from(new Set(fileKeys.filter((k) => !!k)));
      const responses = await firstValueFrom(
        this.storageService.getLightweightItemsByKeys(distinctKeys)
      );

      this.responses$.next(
        fileKeys.map((fileKey) => ({
          fileKey,
          fileData: responses[distinctKeys.indexOf(fileKey)],
        }))
      );
    });

  constructor(
    private storageService: LightweightStorageItemService,
  ) {
    super();
  }

  public async getImage(imageKey: string): Promise<string> {
    const file = await this.getFile(imageKey);
    if (!file) return null;
    return this.fileHelper.base64ToDataURL("application/image", file);
  }

  public async getFile(fileKey: string): Promise<string> {
    // Try to get the file from cache.
    const item = await getOrAddCacheItem<LightweightStorageCacheItem, string>(
      db.lightweightStorageItems,
      fileKey,
      60 * 60 * 24,
      () => {
        // If not found in cache, add a request to the queue.
        this.requests$.next(fileKey);

        // Return a promise that will be resolved by the queue handler.
        return new Promise((resolve) => {
          this.responses$.subscribe(async (responses) => {
            const response = responses.find((r) => r.fileKey === fileKey);
            if (response) {
              resolve(
                new LightweightStorageCacheItem(fileKey, response.fileData)
              );
            }
          });
        });
      }
    );

    return item?.content;
  }

  public async resetCache(key: string): Promise<void> {
    await db.lightweightStorageItems.delete(key);
  }
}
