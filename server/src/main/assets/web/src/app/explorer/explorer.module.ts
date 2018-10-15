import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {MenubarModule} from 'primeng/menubar';
import { ExplorerRoutingModule } from './explorer-routing.module';
import { WindowComponent } from './window/window.component';
import {SharedModule} from '../shared/shared.module';
import { FileGridComponent } from './file-grid/file-grid.component';

@NgModule({
  imports: [
    CommonModule,
    ExplorerRoutingModule,
    BreadcrumbModule,
    MenubarModule,
    SharedModule
  ],
  declarations: [WindowComponent, FileGridComponent]
})
export class ExplorerModule { }
