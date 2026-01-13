import { Component, Input } from "@angular/core";
import { ChatWidgetFlyoutService } from "../chat-widget-flyout.service";

@Component({
  standalone: false,
  selector: "app-chat-widget-flyout-button",
  templateUrl: "./chat-widget-flyout-button.component.html",
  styleUrls: ["./chat-widget-flyout-button.component.scss"],
})
export class ChatWidgetFlyoutButtonComponent {
  public get btnStyle(): string {
    let style = `position: absolute; width: ${this.size}px; height: ${this.size}px;`;
    if (this.stick === "right") {
      style += `right: 5px;`;
      style += `top: calc(${this.offset}vh - ${this.size / 2}px);`;
    }

    return style;
  }

  @Input()
  offset: number;
  @Input()
  stick: "right";
  @Input()
  size: number;

  constructor(private flyoutService: ChatWidgetFlyoutService) {
    
  }

  openChat(): void {
    this.flyoutService.open();
  }
}
