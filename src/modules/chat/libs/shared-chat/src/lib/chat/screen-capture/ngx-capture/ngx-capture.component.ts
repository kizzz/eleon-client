/// THIS COMPONENT WAS TAKEN FROM https://github.com/Wanchai/ngx-capture

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { Subject } from "rxjs";
import { take, tap } from "rxjs/operators";
import { CropDimensions, NgxCaptureService } from "./ngx-capture.service";

type Point = {
  x: number;
  y: number;
};

@Component({
  standalone: false,
  selector: "ngx-capture",
  template: `
    <ng-content></ng-content>
    <div class="overlay" [ngClass]="{ drawing: isDrawing }" #over>
      <div class="rectangle" #rect></div>

      <div
        #topBackground
        class="rectangle-background"
        style="top: 0; left: 0; width: 100vw"
      ></div>
      <div #rightBackground class="rectangle-background"></div>
      <div
        #botBackground
        class="rectangle-background"
        style="left: 0; width: 100vw"
      ></div>
      <div #leftBackground class="rectangle-background"></div>
    </div>
  `,
  styleUrls: ["./ngx-capture.component.scss"],
})
export class NgxCaptureComponent implements OnInit, AfterViewInit {
  @ViewChild("rect", { static: true }) rectangle: ElementRef;
  @ViewChild("over", { static: true }) overlay: ElementRef;
  @ViewChild("topBackground", { static: true }) topBackground: ElementRef;
  @ViewChild("rightBackground", { static: true }) rightBackground: ElementRef;
  @ViewChild("botBackground", { static: true }) botBackground: ElementRef;
  @ViewChild("leftBackground", { static: true }) leftBackground: ElementRef;

  @Input() target: any;
  @Output() resultImage = new EventEmitter<string>();

  rect: HTMLElement;
  captureZone: HTMLElement;

  isDrawing = false;

  mouseStart: Point = { x: 0, y: 0 };

  cropDimensions: CropDimensions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  destroy$ = new Subject<void>();

  constructor(private captureService: NgxCaptureService) {}

  ngOnInit() {
    setTimeout(() => {
      this.rect = this.rectangle.nativeElement;
      this.captureZone = this.overlay.nativeElement;

      if (!this.captureZone) {
        console.warn('"captureZone" is not set');
        return;
      }

      this.captureZone.onmousedown = (e) => (
        e.preventDefault(), this.startCapture(e)
      );
      this.captureZone.onmousemove = (e) => (
        e.preventDefault(), this.drawRect(e)
      );
      this.captureZone.onmouseup = (e) => (
        e.preventDefault(), this.endCapture()
      );
    }, 2000);
  }

  ngAfterViewInit(): void {}

  private startCapture(e: any) {
    const mouse = this.setMousePosition(e, true);

    this.isDrawing = true;

    this.cropDimensions = {
      x: mouse.x,
      y: mouse.y,
      width: 0,
      height: 0,
    };

    this.captureZone.style.cursor = "crosshair";
  }

  private drawRect(e: any) {
    if (this.isDrawing) {
      const mouse = this.setMousePosition(e, false);

      if (mouse.x <= 0 || mouse.y <= 0) return;

      this.cropDimensions = {
        x: mouse.x - this.mouseStart.x < 0 ? mouse.x : this.mouseStart.x,
        y: mouse.y - this.mouseStart.y < 0 ? mouse.y : this.mouseStart.y,
        width: Math.abs(mouse.x - this.mouseStart.x),
        height: Math.abs(mouse.y - this.mouseStart.y),
      };

      this.setRectangle();
    }
  }

  private setMousePosition(e: any, isStart = false): Point {
    const ev = e || window.event; // Moz || IE
    const mouse: Point = { x: 0, y: 0 };

    if (ev.pageX) {
      // Moz
      mouse.x = ev.clientX;
      mouse.y = ev.clientY;
    } else if (ev.clientX) {
      // IE
      mouse.x = ev.clientX + document.body.scrollLeft;
      mouse.y = ev.clientY + document.body.scrollTop;
    }

    if (isStart) {
      this.mouseStart.x = mouse.x;
      this.mouseStart.y = mouse.y;
    }

    return mouse;
  }

  private endCapture() {
    this.captureZone.style.cursor = "default";
    this.isDrawing = false;

    const padding = 2;
    this.captureService
      .getImage(this.target, false, {
        width: this.cropDimensions.width - padding,
        height: this.cropDimensions.height - padding,
        x: this.cropDimensions.x + window.scrollX + padding,
        y: this.cropDimensions.y + window.scrollY + padding,
      })
      .pipe(
        take(1),
        tap((img) => {
          this.resultImage.emit(img);
        })
      )
      .subscribe();

    this.cropDimensions = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    this.setRectangle();
  }

  private setRectangle() {
    this.rect.style.left = this.cropDimensions.x + "px";
    this.rect.style.top = this.cropDimensions.y + "px";
    this.rect.style.width = this.cropDimensions.width + "px";
    this.rect.style.height = this.cropDimensions.height + "px";

    const top = this.cropDimensions.y;
    const left = this.cropDimensions.x;
    const right = left + this.cropDimensions.width;
    const bottom = top + this.cropDimensions.height;

    // Top rect
    this.topBackground.nativeElement.style.height = top + "px";

    // Right rect
    this.rightBackground.nativeElement.style.top = top + "px";
    this.rightBackground.nativeElement.style.left = right + "px";
    this.rightBackground.nativeElement.style.width =
      (window.innerWidth - right).toString() + "px";
    this.rightBackground.nativeElement.style.height =
      (bottom - top).toString() + "px";

    // Bottom rect
    this.botBackground.nativeElement.style.top = bottom + "px";
    this.botBackground.nativeElement.style.height =
      window.innerHeight - bottom + "px";

    // Left rect
    this.leftBackground.nativeElement.style.top = top + "px";
    this.leftBackground.nativeElement.style.left = 0 + "px";
    this.leftBackground.nativeElement.style.width = left + "px";
    this.leftBackground.nativeElement.style.height =
      (bottom - top).toString() + "px";
  }
}
