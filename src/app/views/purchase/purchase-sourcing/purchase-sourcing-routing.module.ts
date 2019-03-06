import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {QuotationComponent} from './quotation/quotation.component';
import {InquiryComponent} from './inquiry/inquiry.component';
const routes: Routes = [
  {path: '', redirectTo: 'inquiry', pathMatch: 'full'},
  {path: 'inquiry', component: InquiryComponent},
  {path: 'quotation', component: QuotationComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseSourcingRoutingModule { }
