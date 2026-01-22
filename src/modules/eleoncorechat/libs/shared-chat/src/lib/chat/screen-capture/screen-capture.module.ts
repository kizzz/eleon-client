import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ScreenCaptureCropperComponent } from "./screen-capture-cropper/screen-capture-cropper.component";
import { NgxCaptureComponent } from "./ngx-capture/ngx-capture.component";
import { ScreenCaptureEditorComponent } from "./screen-capture-editor/screen-capture-editor.component";
import { ButtonModule } from "primeng/button";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { ImageDrawerModule } from "../image-drawer/image-drawer.module";
import { DialogModule } from 'primeng/dialog'


@NgModule({
  declarations: [
    ScreenCaptureCropperComponent,
    NgxCaptureComponent,
    ScreenCaptureEditorComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ImageDrawerModule,
    DialogModule,
    ButtonModule,
  ],
  exports: [ScreenCaptureCropperComponent],
})
export class ScreenCaptureModule {}
