import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MaterialManageComponent} from './material-manage/material-manage.component';
import {InventoryComponent} from './inventory/inventory.component';
import {StorageRecordsComponent} from './storage-records/storage-records.component';
import {DepotStockComponent} from './depot-stock/depot-stock.component';
import {RegionalAllocationComponent} from '../warehouse/regional-allocation/regional-allocation.component';
import { AgreementSettlementComponent } from './agreement-settlement/agreement-settlement.component';

const routes: Routes = [
  {path: '', redirectTo: 'basicData', pathMatch: 'full'},
  {path: 'basicData', loadChildren: './basic-data/basic-data.module#BasicDataModule'},
  {path: 'warehouseOut', loadChildren: './warehouse-out/warehouse-out.module#WarehouseOutModule'},
  {path: 'warehouseIn', loadChildren: './warehouse-in/warehouse-in.module#WarehouseInModule'},
  {path: 'purchaseIn', loadChildren: './purchase-in/purchase-in.module#PurchaseInModule'},
  {path: 'pickingOut', loadChildren: './picking-out/picking-out.module#PickingOutModule'},
  {path: 'barCodeManage', loadChildren: './barcode-manage/barcode-manage.module#BarcodeManageModule'},
  {path: 'materialManage', component: MaterialManageComponent},
  {path: 'inventory', component: InventoryComponent},
  {path: 'storageRecords', component: StorageRecordsComponent},
  {path: 'depotStock', component: DepotStockComponent},
  {path: 'regionalAllocation', component: RegionalAllocationComponent},
  {path: 'agreementSettlement', component: AgreementSettlementComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class WarehouseRoutingModule {
}
