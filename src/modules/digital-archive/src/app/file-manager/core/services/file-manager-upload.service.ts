import { Injectable, signal } from '@angular/core';
import { FileProgress } from '../file-progress';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root'
})
export class FileManagerUploadService {
  public readonly documentUploadProgress = signal<FileProgress[]>([]);
  public progressBarOverlay: DynamicDialogRef;

  public updateDocumentUploadProgress(fileName: string, percentage: number, isError = false, error = "") {
      const fileProcess: FileProgress = {
        id: fileName,
        percentage: percentage,
        isError: isError,
        error: error
      };
      this.documentUploadProgress.update(fileProcessList => 
        fileProcessList.map(obj => fileProcess.id === obj.id ? fileProcess : obj));
    }
  
  public initializeDocumentUploadProcess(id: string) {
    this.documentUploadProgress.update(fileProcessList => {
      fileProcessList.filter(c => c.id != id);
      fileProcessList.push({id: id, percentage: 0, error: ""})
      return fileProcessList;
  });
  }
  
    public resetDocumentUploadProcess() {
      this.documentUploadProgress.set([]);
    }
}
