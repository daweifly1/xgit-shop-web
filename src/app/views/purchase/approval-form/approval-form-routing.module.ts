import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {NegotiationPlanComponent} from './negotiation-plan/negotiation-plan.component';
import {ApprovalFormListComponent} from './approval-form-list/approval-form-list.component';
import {ApprovalLineAuditComponent} from './approval-line-audit/approval-line-audit.component';
import { NegotiationMinutesComponent } from './negotiation-minutes/negotiation-minutes.component';
const routes: Routes = [
  {path: '', redirectTo: 'negotiationPlan', pathMatch: 'full'},
  {path: 'approvalFormList', component: ApprovalFormListComponent},
  {path: 'approvalLineAudit', component: ApprovalLineAuditComponent},
  {path: 'negotiationPlan', component: NegotiationPlanComponent},
  {path: 'negotiationMinutes', component: NegotiationMinutesComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalFormRoutingModule { }
