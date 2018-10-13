import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WindowComponent} from './window/window.component';

const routes: Routes = [
  {
    path: '',
    component: WindowComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExplorerRoutingModule { }
