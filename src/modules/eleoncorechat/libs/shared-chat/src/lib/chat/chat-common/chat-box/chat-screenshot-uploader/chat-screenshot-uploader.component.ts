import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NbChatFormComponent } from "@nebular/theme";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { ScreenCaptureService } from "src/modules/eleoncorechat/libs/shared-chat/src";

@Component({
  standalone: false,
  selector: "app-chat-screenshot-uploader",
  templateUrl: "./chat-screenshot-uploader.component.html",
  styleUrls: ["./chat-screenshot-uploader.component.scss"],
})
export class ChatScreenshotUploaderComponent {
  @Input()
  chat: UserChatInfoDto;
  @Input()
  chatForm: NbChatFormComponent;

  @Output()
  loadingChange = new EventEmitter<boolean>();

  constructor(
    private screenCaptureService: ScreenCaptureService,
    private fileHelper: FileHelperService
  ) {}

  public makeScreenshot(): void {
    this.makeScreenshotAndUpload("fullscreen");
  }

  public makeCroppedScreenshot(): void {
    this.makeScreenshotAndUpload("region");
  }

  private makeScreenshotAndUpload(
    captureType: "fullscreen" | "region"
  ): Promise<void> {
    this.loadingChange.emit(true);

    let overlay: HTMLElement;
    if (captureType === "fullscreen") {
      overlay = this.createCaptureOverlay();
    }

    // let chatFlyout = DrawerComponent.getInstance("chat_flyout");
    // chatFlyout?.hide();

    return new Promise((resolve) => {
      setTimeout(async () => {
        const scrn = await this.screenCaptureService.captureScreen(
          captureType,
          true,
          () => {
            overlay?.remove();
            // chatFlyout?.show();
          }
        );

        if (!scrn) {
          resolve();
          this.loadingChange.emit(false);
          return;
        }

        const scrnFile = this.fileHelper.dataURLtoFile(scrn, "screenshot.png");
        await this.addFileToChatForm(scrnFile);
        this.loadingChange.emit(false);
        resolve();
      }, 100);
    });
  }

  private addFileToChatForm(file: any): Promise<void> {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = (e) => {
        file.src = e.target.result;
        file.urlStyle = this.chatForm["domSanitizer"].bypassSecurityTrustStyle(
          `url(${file.src})`
        );
        this.chatForm.droppedFiles.push(file);
        this.chatForm["cd"].detectChanges();
        resolve();
      };
      fr.readAsDataURL(file);
    });
  }

  private createCaptureOverlay(): HTMLElement {
    const overlay = document.createElement("div");
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.zIndex = "10000";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.classList.add("capture-overlay");
    document.body.appendChild(overlay);
    return overlay;
  }
}
