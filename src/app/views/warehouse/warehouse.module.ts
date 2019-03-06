import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {WarehouseRoutingModule} from './warehouse-routing.module';
import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';

import { MaterialManageComponent } from './material-manage/material-manage.component';
import { AddMaterialComponent } from './material-manage/add-material/add-material.component';
import { MaterialDetailComponent } from './material-manage/material-detail/material-detail.component';
import { StorageRecordsComponent } from './storage-records/storage-records.component';
import { DepotStockComponent } from './depot-stock/depot-stock.component';
import { InventoryComponent } from './inventory/inventory.component';
import { DetailStockComponent } from './depot-stock/detail-stock/detail-stock.component';
import { AddinventoryComponent } from './inventory/addinventory/addinventory.component';
import { DetailinventoryComponent } from './inventory/detailinventory/detailinventory.component';
import { RegionalAllocationComponent } from './regional-allocation/regional-allocation.component';
import { AddRegionAllotComponent } from './regional-allocation/add-region-allot/add-region-allot.component';
import { ReceiveRetionAllotComponent } from './regional-allocation/receive-retion-allot/receive-retion-allot.component';
import { DetailRetionAllotComponent } from './regional-allocation/detail-retion-allot/detail-retion-allot.component';
import { AgreementSettlementComponent } from './agreement-settlement/agreement-settlement.component';
import { AddSettlementComponent } from './agreement-settlement/add-settlement/add-settlement.component';
import { DetailSettlementComponent } from './agreement-settlement/detail-settlement/detail-settlement.component';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    WarehouseRoutingModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    MaterialManageComponent,
    AddMaterialComponent,
    MaterialDetailComponent,
    StorageRecordsComponent,
    DepotStockComponent,
    InventoryComponent,
    DetailStockComponent,
    AddinventoryComponent,
    DetailinventoryComponent,
    RegionalAllocationComponent,
    AddRegionAllotComponent,
    DetailRetionAllotComponent,
    ReceiveRetionAllotComponent,
    AgreementSettlementComponent,
    AddSettlementComponent,
    DetailSettlementComponent
  ]
})
export class WarehouseModule {
}
