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
import {DialogModule} from 'primeng/dialog';
import {ImageViewerModule} from '@hallysonh/ngx-imageviewer';
import {FormsModule} from '@angular/forms';
import {DeferModule} from 'primeng/defer';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ExplorerRoutingModule,
    BreadcrumbModule,
    ButtonModule,
    MenubarModule,
    SharedModule,
    DragToSelectModule.forRoot(),
    ToolbarModule,
    ProgressSpinnerModule,
    DialogModule,
    ImageViewerModule,
    LazyLoadImagesModule,
    ConfirmDialogModule
  ],
  declarations: [WindowComponent, FileGridComponent, ExplorerComponent, BreadcrumbsComponent, EmptyFolderComponent, GridItemComponent],
  entryComponents: [WindowComponent]
})
export class ExplorerModule { }
