import { Injectable } from "@angular/core";
import { Subject, firstValueFrom } from "rxjs";
import { NgxCaptureService } from "./ngx-capture/ngx-capture.service";

@Injectable({
  providedIn: "root",
})
export class ScreenCaptureService {
  private showCropperSubj$ = new Subject<any>();
  public showCropper$ = this.showCropperSubj$.asObservable();

  private showEditorSubj$ = new Subject<string>();
  public showEditor$ = this.showEditorSubj$.asObservable();

  private cropped$ = new Subject<string>();
  private edited$ = new Subject<string>();

  constructor(private ngxCaptureService: NgxCaptureService) {}

  public captureScreen(
    captureType: "fullscreen" | "region",
    showEditor: boolean = false,
    afterCapture?: () => void
  ): Promise<string> {
    let capturePromise: Promise<string> = null;
    if (captureType === "fullscreen") {
      capturePromise = this.captureFullscreen();
    } else if (captureType === "region") {
      capturePromise = this.captureRegion();
    }

    if (afterCapture) {
      capturePromise.then(afterCapture);
    }

    if (showEditor) {
      return capturePromise.then((img) => this.editImage(img));
    }

    return capturePromise;
  }

  public saveCroppedImage(img: string): void {
    this.cropped$.next(img);
  }

  public saveEditedImage(img: string): void {
    this.edited$.next(img);
  }

  private captureFullscreen(): Promise<string> {
    return firstValueFrom(
      this.ngxCaptureService.getImage(document.body, true, null)
    );
  }

  private editImage(img: string): Promise<string> {
    this.showEditorSubj$.next(img);
    return new Promise((resolve) => {
      const sub = this.edited$.subscribe((editedImg) => {
        sub.unsubscribe();
        resolve(editedImg);
      });
    });
  }

  private captureRegion(): Promise<string> {
    this.showCropperSubj$.next(document.body);
    return new Promise((resolve) => {
      const sub = this.cropped$.subscribe((img) => {
        sub.unsubscribe();
        resolve(img);
      });
    });
  }
}
