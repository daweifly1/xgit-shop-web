import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PurchasePlanComponent} from './purchase-plan-audit/purchase-plan.component';
import {PurchasePlanAllotComponent} from './purchase-plan-allot/purchase-plan-allot.component';
import {PurchasePlanExecuteComponent} from './purchase-plan-execute/purchase-plan-execute.component';
import {DevicePurchaseComponent} from './device-purchase/device-purchase.component';
import {MaterialPartsPurchaseComponent} from './material-parts-purchase/material-parts-purchase.component';
import {EquipmentProjectBudgetComponent} from './equipment-project-budget/equipment-project-budget.component';
import { ReturnListComponent } from './return-list/return-list.component';
const routes: Routes = [
  {path: '', redirectTo: 'device', pathMatch: 'full'},
  {path: 'materialAndParts', component: MaterialPartsPurchaseComponent},
  {path: 'device', component: DevicePurchaseComponent},
  {path: 'equipmentProjectBudget', component: EquipmentProjectBudgetComponent},
  {path: 'unifiedPurchaseAudit', component: PurchasePlanComponent},
  {path: 'unifiedPurchaseAllot', component: PurchasePlanAllotComponent},
  {path: 'execute', component: PurchasePlanExecuteComponent},
  {path: 'returnList', component: ReturnListComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasePlanRoutingModule { }
