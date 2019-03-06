import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PurchaseContractComponent} from './purchase-contract/purchase-contract.component';
import {PurchaseConfirmationComponent} from './purchase-confirmation/purchase-confirmation.component';

const routes: Routes = [
  {path: '', redirectTo: 'demandPlan', pathMatch: 'full'},
  {path: 'demandPlan', loadChildren: './demand-plan-handle/demand-plan-handle.module#DemandPlanHandleModule'},
  {path: 'purchasePlan', loadChildren: './purchase-plan/purchase-plan.module#PurchasePlanModule'},
  {path: 'approvalForm', loadChildren: './approval-form/approval-form.module#ApprovalFormModule'},
  {path: 'contract', component: PurchaseContractComponent},
  {path: 'clause', loadChildren: './clause/clause.module#ClauseModule'},
  {path: 'purchaseConfirmation', component: PurchaseConfirmationComponent},
  {path: 'sourcing', loadChildren: './purchase-sourcing/purchase-sourcing.module#PurchaseSourcingModule'},
  {path: 'report', loadChildren: './purchase-report/purchase-report.module#PurchaseReportModule'}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class PurchaseRoutingModule {
}
