import { Component, Query, QueryList, ViewChildren } from "@angular/core";
import { ScreenCaptureService } from "../screen-capture.service";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { ImageDrawerBoxComponent } from "../../image-drawer/image-drawer-box/image-drawer-box.component";

@Component({
  standalone: false,
  selector: "app-screen-capture-editor",
  templateUrl: "./screen-capture-editor.component.html",
  styleUrls: ["./screen-capture-editor.component.scss"],
})
export class ScreenCaptureEditorComponent {
  @ViewChildren(ImageDrawerBoxComponent) public imageDrawerBox =
    new QueryList<ImageDrawerBoxComponent>();

  public showDialog: boolean = false;
  public src: string = null;

  constructor(
    private screenCaptureService: ScreenCaptureService,
    private fileHelper: FileHelperService
  ) {
    this.screenCaptureService.showEditor$.subscribe((img) => {
      if (!img) {
        return;
      }

      this.open(img);
    });
  }

  public get drawerWidth(): number {
    return window.innerWidth - 100;
  }

  public get drawerHeight(): number {
    return window.innerHeight * 0.8;
  }

  public open(img: string): void {
    this.src = img;
    this.showDialog = true;
  }

  public close(): void {
    this.showDialog = false;
    this.src = null;
  }

  public onShowDialogChange(show: boolean): void {
    if (!show && !!this.src) {
      this.onCancel();
    }
  }

  public async onSave(blob: Blob): Promise<void> {
    const dataUrl = await this.fileHelper.blobToDataURL(blob);
    this.screenCaptureService.saveEditedImage(dataUrl);
    this.close();
  }

  public onCancel(): void {
    this.screenCaptureService.saveEditedImage(null);
    this.close();
  }

  public save(): void {
    this.imageDrawerBox.first?.saveImage();
  }
}
