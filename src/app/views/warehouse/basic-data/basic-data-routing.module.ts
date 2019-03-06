import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {WarehouseManageComponent} from './warehouse-manage/warehouse-manage.component';
import {BillTypeComponent} from './bill-type/bill-type.component';
import { AgreementMaterialrefComponent } from './agreement-materialref/agreement-materialref.component';

const routes: Routes = [
  {path: '', redirectTo: 'warehouseManage', pathMatch: 'full'},
  {path: 'warehouseManage', component: WarehouseManageComponent},
  {path: 'billType', component: BillTypeComponent},
  {path: 'agreementMaterialRef', component: AgreementMaterialrefComponent}
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class BasicDataRoutingModule {
}
