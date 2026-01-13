import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileManagerExplorerComponent } from './file-manager-explorer/file-manager-explorer.component';
import { FileExternalViewComponent } from './file-external-view/file-external-view.component';
import { FileArchivesDashboardComponent } from './digital-archive/file-archives/file-archives-dashboard/file-archives-dashboard.component';
// import { resetLayoutGuard } from 'src/app/layout/guards/reset-layout.guard';

const routes: Routes = [
  {
    path: 'drives',
    component : FileArchivesDashboardComponent,
    data:{
      name: "FileManager::Menu:DigitalArchive",
      dashboardMode: 'drives',
    }
  },
  {
    path: 'mydrives',
    component : FileArchivesDashboardComponent,
    data:{
      name: "FileManager::Menu:DigitalArchive",
      dashboardMode: 'mydrives',
    }
  },
  {
    path: 'explorer',
    component: FileManagerExplorerComponent,
    data:{
      name:"FileManager::Details",
      parentNames: "FileManager::Menu:DigitalArchive",
    }
  },
  {
    path: 'explorer/:archiveid',
    component: FileManagerExplorerComponent,
    data:{
      name:"FileManager::Details",
      parentNames: "FileManager::Menu:DigitalArchive",
    }
  },
  {
    path: 'explorer/:archiveid/:id',
    component: FileManagerExplorerComponent,
    data:{
      name:"FileManager::Details",
      parentNames: "FileManager::Menu:DigitalArchive",
    }
  },
  {
    path: 'internal/:id',
    component: FileExternalViewComponent,
    data:{
      name:"FileManager::Details",
      parentNames: "FileManager::Menu:DigitalArchive",
    },
    // canDeactivate: [
    //   resetLayoutGuard,
    // ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileManagerRoutingModule { }
