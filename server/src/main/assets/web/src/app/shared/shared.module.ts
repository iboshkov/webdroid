import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModalComponent } from './ng-modal/ng-modal.component';
import {ResizableModule} from 'angular-resizable-element';

const COMPONENTS = [
  NgModalComponent
];

@NgModule({
  imports: [
    CommonModule,
    ResizableModule
  ],
  bootstrap: COMPONENTS,
  declarations: COMPONENTS,
  exports: COMPONENTS
})
export class SharedModule { }
