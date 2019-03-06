import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceContactComponent} from './invoice-contact/invoice-contact.component';


const routes: Routes = [
  {path: '', redirectTo: 'invoiceContact', pathMatch: 'full'},
  {path: 'invoiceContact', component: InvoiceContactComponent}
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CloudSettleRoutingModule {
}
