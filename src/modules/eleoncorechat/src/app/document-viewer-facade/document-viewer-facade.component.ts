import { Component } from "@angular/core";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { DocumentViewerModule } from '@eleon/primeng-ui.lib';

@Component({
  selector: "app-document-viewer-facade",
  template: "<app-document-viewer></app-document-viewer>",
  standalone: true,
  imports: [
    SharedModule,
    DocumentViewerModule,
  ],
})
export class DocumentViewerFacadeComponent {
}
