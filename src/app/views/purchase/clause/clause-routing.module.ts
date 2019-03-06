import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClauseListComponent } from './clause-list/clause-list.component';
import { ContractClauseTemplateComponent } from './contract-clause-template/contract-clause-template.component';

const routes: Routes = [
  {path: '', redirectTo: 'clauseList', pathMatch: 'full'},
  {path: 'clauseList', component: ClauseListComponent},
  {path: 'contractClauseTemplate', component: ContractClauseTemplateComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClauseRoutingModule { }
