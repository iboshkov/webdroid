import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModalComponent } from './ng-modal/ng-modal.component';

const COMPONENTS = [
  NgModalComponent
];

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS
})
export class SharedModule { }
