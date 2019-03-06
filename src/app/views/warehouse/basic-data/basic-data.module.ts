import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import {BasicDataRoutingModule} from './basic-data-routing.module';

import {WarehouseManageComponent} from './warehouse-manage/warehouse-manage.component';
import { AddWarehouseAreaComponent } from './warehouse-manage/add-warehouse-area/add-warehouse-area.component';
import { AddLocationComponent } from './warehouse-manage/add-location/add-location.component';
import { WarehouseAreaManageComponent } from './warehouse-manage/warehouse-area-manage/warehouse-area-manage.component';
import { LocationManageComponent } from './warehouse-manage/location-manage/location-manage.component';
import { AddWarehouseComponent } from './warehouse-manage/add-warehouse/add-warehouse.component';
import { BillTypeComponent } from './bill-type/bill-type.component';
import { AddBillComponent } from './bill-type/add-bill/add-bill.component';
import { AgreementMaterialrefComponent } from './agreement-materialref/agreement-materialref.component';
import { AddMaterialrefComponent } from './agreement-materialref/add-materialref/add-materialref.component';

@NgModule({
  imports: [
    CommonModule,
    BasicDataRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    WarehouseManageComponent,
    AddWarehouseAreaComponent,
    AddLocationComponent,
    WarehouseAreaManageComponent,
    LocationManageComponent,
    AddWarehouseComponent,
    BillTypeComponent,
    AddBillComponent,
    AgreementMaterialrefComponent,
    AddMaterialrefComponent
  ]
})
export class BasicDataModule { }
