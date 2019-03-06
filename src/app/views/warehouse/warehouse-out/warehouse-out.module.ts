import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WarehouseOutRoutingModule } from './warehouse-out-routing.module';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import { AbnormalOutComponent } from './abnormal-out/abnormal-out.component';
import { AbnormalDetailComponent } from './abnormal-out/abnormal-detail/abnormal-detail.component';
import { AddAbnormalOutComponent } from './abnormal-out/add-abnormal-out/add-abnormal-out.component';
import { EditAbnormalOutComponent } from './abnormal-out/edit-abnormal-out/edit-abnormal-out.component';
import { PurchaseOutComponent } from './purchase-out/purchase-out.component';
import { AddPurchaseOutComponent } from './purchase-out/add-purchase-out/add-purchase-out.component';
import { DetailPurchaseOutComponent } from './purchase-out/detail-purchase-out/detail-purchase-out.component';
import { StockRecordSelectComponent } from './purchase-out/stock-record-select/stock-record-select.component';

@NgModule({
  imports: [
    CommonModule,
    WarehouseOutRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    AbnormalOutComponent,
    AbnormalDetailComponent,
    AddAbnormalOutComponent,
    EditAbnormalOutComponent,
    PurchaseOutComponent,
    AddPurchaseOutComponent,
    DetailPurchaseOutComponent,
    StockRecordSelectComponent,
  ]
})
export class WarehouseOutModule { }
