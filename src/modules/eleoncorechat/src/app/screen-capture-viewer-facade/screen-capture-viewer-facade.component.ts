import { Component } from "@angular/core";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { ScreenCaptureModule } from 'src/modules/eleoncorechat/libs/shared-chat/src';

@Component({
  selector: "app-screen-capture-viewer-facade",
  template: "<app-screen-capture-cropper></app-screen-capture-cropper>",
  standalone: true,
  imports: [
    SharedModule,
    ScreenCaptureModule,
  ],
})
export class ScreenCaptureViewerFacadeComponent {
}
