import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {BeginningWarehouseComponent} from './beginning-warehouse/beginning-warehouse.component';
import {OtherWarehouseComponent} from './other-warehouse/other-warehouse.component';

const routes: Routes = [
  {path: '', redirectTo: 'beginningWarehouseManage', pathMatch: 'full'},
  {path: 'otherWarehouseManage', component: OtherWarehouseComponent},
  {path: 'beginningWarehouseManage', component: BeginningWarehouseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WarehouseInRoutingModule { }
