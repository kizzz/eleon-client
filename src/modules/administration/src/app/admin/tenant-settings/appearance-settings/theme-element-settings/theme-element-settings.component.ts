import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { FileUpload, FileUploadEvent } from "primeng/fileupload";

@Component({
  standalone: false,
  selector: "app-theme-element-settings",
  templateUrl: "./theme-element-settings.component.html",
  styleUrl: "./theme-element-settings.component.scss",
})
export class ThemeElementSettingsComponent {
  @ViewChild(FileUpload) fileUpload: FileUpload;

  @Input()
  public src: string;

  @Input()
  public title: string;

  @Input()
  public foregroundClass: string;

  @Output()
  public upload = new EventEmitter<FileUploadEvent>();

  @Output()
  public reset = new EventEmitter<void>();

  public onFileUpload(event: FileUploadEvent): void {
    this.fileUpload.clear();
    this.upload.emit(event);
  }
}
