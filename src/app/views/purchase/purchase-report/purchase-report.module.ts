
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';
import { PurchaseReportRoutingModule } from './purchase-report-routing.module';
// import {CommonComponentModule} from '../common-component/common-component.module';
import { CoreIndexComponent } from './core-index/core-index.component';
import { NgxEchartsModule } from 'ngx-echarts';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    PurchaseReportRoutingModule,
    NgxEchartsModule
    // CommonComponentModule
  ],
  declarations: [
    CoreIndexComponent
  ]
})
export class PurchaseReportModule { }
