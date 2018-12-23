import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetComponent } from './widget/widget.component';
import {ProgressBarModule} from 'primeng/progressbar';

@NgModule({
  imports: [
    CommonModule,
    ProgressBarModule
  ],
  exports: [WidgetComponent],
  declarations: [WidgetComponent]
})
export class PhoneStatusModule { }
