import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WindowComponent} from './window/window.component';
import {FileGridComponent} from './file-grid/file-grid.component';

const routes: Routes = [
  {
    path: 'files',
    outlet: 'explorer',
    component: WindowComponent,
    children: [
      {
        path: '**',
        component: FileGridComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'files'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExplorerRoutingModule { }
