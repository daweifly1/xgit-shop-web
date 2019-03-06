import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {DispatchBillComponent} from './dispatch-bill/dispatch-bill.component';
import {ReceivingNoteComponent} from './receiving-note/receiving-note.component';
import {WarehouseWarrantComponent} from './warehouse-warrant/warehouse-warrant.component';

const routes: Routes = [
  {path: '', redirectTo: 'dispatchBill', pathMatch: 'full'},
  {path: 'receivingNote', component: ReceivingNoteComponent},
  {path: 'dispatchBill', component: DispatchBillComponent},
  {path: 'warehouseWarrant', component: WarehouseWarrantComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseInRoutingModule { }
