
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoreIndexComponent } from './core-index/core-index.component';

const routes: Routes = [
  {path: '', redirectTo: 'coreIndex', pathMatch: 'full'},
  {path: 'coreIndex', component: CoreIndexComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseReportRoutingModule { }
