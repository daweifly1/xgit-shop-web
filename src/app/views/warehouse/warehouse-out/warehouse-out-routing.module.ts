import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbnormalOutComponent } from './abnormal-out/abnormal-out.component';
import { PurchaseOutComponent } from './purchase-out/purchase-out.component';



const routes: Routes = [
  {path: '', redirectTo: 'purchaseReturnOut', pathMatch: 'full'},
  {path: 'abnormalOut', component: AbnormalOutComponent},
  {path: 'purchaseReturnOut', component: PurchaseOutComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WarehouseOutRoutingModule { }
