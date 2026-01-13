import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListComponent } from './task-management/task-list/task-list.component';
import { TaskDetailsComponent } from './task-management/task-details/task-details.component';
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';


const routes: Routes = [
  {
    path: 'tasks',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: TaskListComponent,
        canActivate: [EcAuthGuard, PermissionGuard],
        data:{
          name:"JobScheduler::Menu:Tasks",
          parentNames:"JobScheduler::AdminMenu:Top",
          mainParentName: "AbpUiNavigation::Menu:Administration",
        }
      },
      {
        path: 'details/:id',
        component: TaskDetailsComponent,
        canActivate: [EcAuthGuard, PermissionGuard],
        data:{
          name:"JobScheduler::Breadcrumbs:Task:Details",
          parentNames:"JobScheduler::AdminMenu:Top;JobScheduler::Menu:Tasks",
          mainParentName: "AbpUiNavigation::Menu:Administration",
        }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobSchedulerRoutingModule { }
