import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {MenubarModule} from 'primeng/menubar';
import { ExplorerRoutingModule } from './explorer-routing.module';
import { WindowComponent } from './window/window.component';
import {SharedModule} from '../shared/shared.module';
import { FileGridComponent } from './file-grid/file-grid.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import {HttpClientModule} from '@angular/common/http';
import {DragToSelectModule} from 'ngx-drag-to-select';
import {ToolbarModule} from 'primeng/toolbar';
import {ButtonModule} from 'primeng/button';
import { EmptyFolderComponent } from './empty-folder/empty-folder.component';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { GridItemComponent } from './file-grid/grid-item/grid-item.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ExplorerRoutingModule,
    BreadcrumbModule,
    ButtonModule,
    MenubarModule,
    SharedModule,
    DragToSelectModule.forRoot(),
    ToolbarModule,
    ProgressSpinnerModule
  ],
  declarations: [WindowComponent, FileGridComponent, ExplorerComponent, BreadcrumbsComponent, EmptyFolderComponent, GridItemComponent],
  entryComponents: [WindowComponent]
})
export class ExplorerModule { }
