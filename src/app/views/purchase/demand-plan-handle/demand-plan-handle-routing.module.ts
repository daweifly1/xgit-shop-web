import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DemandPlanComponent} from './demand-plan/demand-plan.component';
import {DemandPlanLineComponent} from './demand-plan-line/demand-plan-line.component';


const routes: Routes = [
  {path: '', redirectTo: 'demandPlanList', pathMatch: 'full'},
  {path: 'demandPlanList', component: DemandPlanComponent},
  {path: 'planLineHandle', component: DemandPlanLineComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemandPlanHandleRoutingModule { }
