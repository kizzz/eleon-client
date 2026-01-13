import { ChangeDetectorRef, Component } from "@angular/core";
import { ScreenCaptureService } from "../screen-capture.service";

@Component({
  standalone: false,
  selector: "app-screen-capture-cropper",
  templateUrl: "./screen-capture-cropper.component.html",
  styleUrls: ["./screen-capture-cropper.component.scss"],
})
export class ScreenCaptureCropperComponent {
  public target: any;

  constructor(
    private screenCaptureService: ScreenCaptureService,
    private cd: ChangeDetectorRef
  ) {
    screenCaptureService.showCropper$.subscribe((x) => {
      this.target = x;
      this.cd.detectChanges();
    });
  }

  public saveImage(img: string): void {
    if (!img) {
      return;
    }

    this.target = null;
    this.screenCaptureService.saveCroppedImage(img);
  }
}
