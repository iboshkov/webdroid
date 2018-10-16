import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {MenubarModule} from 'primeng/menubar';
import { ExplorerRoutingModule } from './explorer-routing.module';
import { WindowComponent } from './window/window.component';
import {SharedModule} from '../shared/shared.module';
import { FileGridComponent } from './file-grid/file-grid.component';
import {ButtonModule, CoreModule, InputModule, ModalModule} from 'truly-ui';
import { ExplorerComponent } from './explorer/explorer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import {HttpClientModule} from '@angular/common/http';
import {DragToSelectModule} from 'ngx-drag-to-select';
import {ToolbarModule} from 'primeng/toolbar';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ExplorerRoutingModule,
    BreadcrumbModule,
    MenubarModule,
    SharedModule,
    DragToSelectModule.forRoot(),
    ToolbarModule
  ],
  declarations: [WindowComponent, FileGridComponent, ExplorerComponent, BreadcrumbsComponent],
  entryComponents: [WindowComponent]
})
export class ExplorerModule { }
