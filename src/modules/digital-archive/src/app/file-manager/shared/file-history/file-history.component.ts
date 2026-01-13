import { Component, Input, OnInit } from '@angular/core';
import { FileManagerType, FileService } from '@eleon/file-manager-proxy';
import { FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first } from 'rxjs';
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { DocumentViewerService } from '@eleon/primeng-ui.lib';
import { isFile } from '../utils/entry-helpers';

@Component({
  standalone: false,
  selector: 'app-file-history',
  templateUrl: './file-history.component.html',
  styleUrls: ['./file-history.component.scss']
})
export class FileHistoryComponent implements OnInit {

  loading: boolean = false;
  files: FileSystemEntryDto[];

  constructor(
    public fileService: FileService,
    public dialogRef: DynamicDialogRef,
    public fileHelper: FileHelperService,
    public messageService: LocalizedMessageService,
    public config: DynamicDialogConfig<{
      archiveId: string,
      fileId: string,
    }>,
    public docViewer: DocumentViewerService,
  ) {

  }
  
  ngOnInit(): void {
    this.loading = true;
    this.fileService.getEntryHistoryByIdAndArchiveIdAndType(this.config.data.fileId, this.config.data.archiveId, FileManagerType.FileArchive)
    .pipe(first())  
    .subscribe(result => {
      this.loading = false;
      this.files = result;
      })
  }

  close(){
    this.dialogRef.close();
  }

  
  download(document: FileSystemEntryDto) {
    if (!isFile(document)) {
      return;
    }
    this.fileService.downloadFileByIdAndIsVersionAndArchiveIdAndType(document.id, false, document.archiveId, FileManagerType.FileArchive)
      .subscribe(
      (event) => {
        this.fileHelper.saveBase64File(event as any, document.name);
      },
    );
  }
  
  getUserId(file: FileSystemEntryDto){
    if(!file) return null;
    return file?.lastModifierId?.length > 0 ? file.lastModifierId : file.creatorId;
  }
  
  getIconFile(row : FileSystemEntryDto): string{
    let icon = '';
    if(row?.id?.length > 0){
      const type = row.name.split(".").pop();
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
