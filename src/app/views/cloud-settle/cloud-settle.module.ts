import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {CloudSettleRoutingModule} from './cloud-settle-routing.module';
import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';
import {InvoiceContactComponent} from './invoice-contact/invoice-contact.component';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    CloudSettleRoutingModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    InvoiceContactComponent
  ]
})
export class CloudSettleModule {
}
