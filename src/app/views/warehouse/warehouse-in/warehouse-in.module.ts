import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WarehouseInRoutingModule } from './warehouse-in-routing.module';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import { BeginningWarehouseComponent } from './beginning-warehouse/beginning-warehouse.component';
import { BeginningDetailComponent } from './beginning-warehouse/beginning-detail/beginning-detail.component';

import {OtherWarehouseComponent} from './other-warehouse/other-warehouse.component';
import {AddotherComponent} from './other-warehouse/addother/addother.component';
import { OtherDetailComponent } from './other-warehouse/other-detail/other-detail.component';
import { OtherEditComponent } from './other-warehouse/other-edit/other-edit.component';

@NgModule({
  imports: [
    CommonModule,
    WarehouseInRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    OtherWarehouseComponent,
    AddotherComponent,
    OtherDetailComponent,
    OtherEditComponent,
    BeginningWarehouseComponent,
    BeginningDetailComponent,
  ]
})
export class WarehouseInModule { }
