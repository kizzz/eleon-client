import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { FileProgress } from '../../core/file-progress';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileManagerUploadService } from '../../core/services/file-manager-upload.service';

@Component({
  standalone: false,
  selector: 'app-file-upload-process',
  templateUrl: './file-upload-process.component.html',
  styleUrls: ['./file-upload-process.component.scss']
})
export class FileUploadProcessComponent implements OnInit {
  panelOpenState = true;
  filesSignal = computed(() => this.fileManagerUploadService.documentUploadProgress());
  constructor(
    private fileManagerUploadService: FileManagerUploadService,
    private dialogRef: DynamicDialogRef) { }

  ngOnInit(): void {
    this.dialogOpenState = true;
  }

  dialogOpenState: boolean = false;

  onClose() {
    if (this.fileManagerUploadService.progressBarOverlay) {
      this.fileManagerUploadService.resetDocumentUploadProcess();
      this.fileManagerUploadService.progressBarOverlay.close();
      this.fileManagerUploadService.progressBarOverlay = null;
    }
  }
  close() {
    this.dialogRef.close();
  }

  loading(files: FileProgress[]){
    return files?.every(x=>x.percentage !== 100);
  }

  getIconFile(row : any): string{
    let icon = '';
    if(row?.id?.length > 0){
      const type = row.id.split(".").pop();
      if(type?.length > 0){
        switch (type.toLocaleLowerCase()) {
          case "doc":
          case "docx":
            return "far fa-file-word";
          case "ppt":
          case "pptx":
            return "far fa-file-powerpoint";
          case "xls":
          case "xlsx":
            return "far fa-file-excel";
          case "jpg":
          case "png":
          case "jpeg":
          case "gif":
          case "tiff":
          case "psd":
          case "bmp":
          case "webp":
          case "raw":
          case "heif":
          case "indd":
          case "svg":
          case "ai":
          case "eps":
            return "far fa-file-image";
          case "3gp":
          case "aa":
          case "aac":
          case "aax":
          case "act":
          case "aiff":
          case "alac":
          case "amr":
          case "ape":
          case "au":
          case "awb":
          case "dss":
          case "dvf":
          case "flac":
          case "gsm":
          case "iklx":
          case "ivs":
          case "m4a":
          case "m4b":
          case "m4p":
          case "mmf":
          case "mp3":
          case "mpc":
          case "msv":
          case "nmf":
          case "ogg":
          case "oga":
          case "mogg":
          case "opus":
          case "org":
          case "ra":
          case "rm":
          case "rf64":
          case "sln":
          case "tta":
          case "voc":
          case "vox":
          case "wav":
          case "wma":
          case "wv":
          case "webm":
            return "far fa-file-audio";
          case "webm":
          case "flv":
          case "vob":
          case "ogv":
          case "ogg":
          case "drc":
          case "avi":
          case "mts":
          case "m2ts":
          case "wmv":
          case "yuv":
          case "viv":
          case "mp4":
          case "m4p":
          case "3pg":
          case "f4v":
          case "f4a":
          case "mkv":
            return "far fa-file-video";
          case "pdf":
            return "far fa-file-pdf";
          case "txt": 
            return "far fa-file-alt";
          case "zip":
          case "zipx":
          case "7z":
          case "rar":
          case "tar.gz":
            return "far fa-file-archive";
          default:
            return "far fa-file";
        }
        
      }
    }
    
    return icon;
  }
}