import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ExplorerModule} from './explorer/explorer.module';
import {ButtonModule, CoreModule, InputModule, ModalModule} from 'truly-ui';
import {HttpClientModule} from '@angular/common/http';
import { PhoneStatusModule } from './phone-status/phone-status.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CoreModule.forRoot({theme: 'default'}),
    ExplorerModule,
    AppRoutingModule,
    PhoneStatusModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
