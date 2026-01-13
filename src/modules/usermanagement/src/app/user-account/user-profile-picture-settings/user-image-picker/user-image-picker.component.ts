import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import Cropper from "cropperjs";

export interface ImageCropperSetting {
  width: number;
  height: number;
}

export interface ImageCropperResult {
  imageData: Cropper.ImageData;
  cropData: Cropper.CropBoxData;
  lowQualityDataUrl?: string;
  highQualityDataUrl?: string;
}

const cropperDefaults: Cropper.Options = {
  aspectRatio: 1.0,
  scalable: true,
  zoomable: true,
  viewMode: 1,
  cropBoxMovable: false,
  cropBoxResizable: false,
  toggleDragModeOnDblclick: false,
  dragMode: "move",
  background: false,
  zoomOnTouch: true,
  zoomOnWheel: true,
  rotatable: false,
  autoCrop: true,
};

@Component({
  standalone: false,
  selector: "app-user-image-picker",
  templateUrl: "./user-image-picker.component.html",
  styleUrl: "./user-image-picker.component.scss",
})
export class UserImagePickerComponent implements OnChanges {
  @ViewChild("image", { static: true }) image: ElementRef;

  @Input() loadImageErrorText: string;
  @Input() cropperOptions: any = {};
  @Input() sideSize: number;

  @Output() saved = new EventEmitter<ImageCropperResult>();
  @Output() canceled = new EventEmitter<void>();
  @Output() ready = new EventEmitter();

  public isLoading: boolean = true;
  public cropper: Cropper;
  public imageElement: HTMLImageElement;
  public loadError: any;
  public exporting = false;

  @Input()
  showDialog: boolean = true;

  @Input({ required: true })
  src: string;

  constructor(private localizationService: ILocalizationService) {}

  ngOnDestroy() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && changes['src'].currentValue) {
      this.isLoading = true;
      this.loadError = false;
      this.showDialog = true;
    }
  }

  public save(): void {
    this.exportCanvas();
  }

  public cancel(): void {
    this.showDialog = false;
    this.canceled.emit();
  }

  /**
   * Image loaded
   * @param ev
   */
  imageLoaded(ev: Event) {
    //
    // Unset load error state
    this.loadError = false;

    //
    // Setup image element
    const image = ev.target as HTMLImageElement;
    this.imageElement = image;

    //
    // Add crossOrigin?
    if (this.cropperOptions.checkCrossOrigin) image.crossOrigin = "anonymous";

    //
    // Image on ready event
    image.addEventListener("ready", () => {
      //
      // Emit ready
      this.ready.emit(true);

      //
      // Unset loading state
      this.isLoading = false;
    });

    // //
    // // Setup aspect ratio according to settings
    // let aspectRatio = NaN;
    // if (this.settings) {
    //   const { width, height } = this.settings;
    //   aspectRatio = width / height;
    // }

    //
    // Set crop options
    // extend default with custom config
    this.cropperOptions = {
      ...cropperDefaults,
      ...{
        checkCrossOrigin: true,
      },
      ...this.cropperOptions,
    };

    //
    // Set cropperjs
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = undefined;
    }
    this.cropper = new Cropper(image, this.cropperOptions);
  }

  /**
   * Image load error
   * @param event
   */
  imageLoadError(event: any) {
    //
    // Set load error state
    this.loadError = true;

    //
    // Unset loading state
    this.isLoading = false;
  }

  exportCanvas() {
    this.exporting = true;

    (async () => {
      const imageData = this.cropper.getImageData();
      const cropData = this.cropper.getCropBoxData();

      const lowQualityDataUrl = this.cropper
        .getCroppedCanvas({
          width: this.sideSize * 0.5,
          height: this.sideSize * 0.5,
          minHeight: this.sideSize * 0.5,
          minWidth: this.sideSize * 0.5,
          maxHeight: this.sideSize * 0.5,
          maxWidth: this.sideSize * 0.5,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        })
        .toDataURL("image/webp");

      const highQualityDataUrl = this.cropper
        .getCroppedCanvas({
          width: this.sideSize,
          height: this.sideSize,
          minHeight: this.sideSize,
          minWidth: this.sideSize,
          maxHeight: this.sideSize,
          maxWidth: this.sideSize,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        })
        .toDataURL("image/webp");

      this.saved.emit({
        imageData,
        cropData,
        lowQualityDataUrl,
        highQualityDataUrl,
      });

      this.showDialog = false;
      this.exporting = false;
    })();
  }
}
