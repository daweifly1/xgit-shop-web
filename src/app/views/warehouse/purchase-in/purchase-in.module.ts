import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseInRoutingModule } from './purchase-in-routing.module';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import {DispatchBillComponent} from './dispatch-bill/dispatch-bill.component';
import {EditDispatchBillComponent} from './dispatch-bill/edit-dispatch-bill/edit-dispatch-bill.component';
import {DispatchBillDetailComponent} from './dispatch-bill/dispatch-bill-detail/dispatch-bill-detail.component';
import {BatchLogisticsDeliveryComponent} from './dispatch-bill/batch-logistics-delivery/batch-logistics-delivery.component';
import {LogisticsDeliveryComponent} from './dispatch-bill/logistics-delivery/logistics-delivery.component';
import {ContractComponent} from './dispatch-bill/contract/contract.component';
import {WarehouseWarrantComponent} from './warehouse-warrant/warehouse-warrant.component';
import {AddReceivingNoteComponent} from './receiving-note/add-receiving-note/add-receiving-note.component';
import {CompactComponent} from './receiving-note/compact/compact.component';
import {ReceivingNoteComponent} from './receiving-note/receiving-note.component';
import {ReceivingNoteDetailComponent} from './receiving-note/receiving-note-detail/receiving-note-detail.component';
import {ReceivingNoteConfirmComponent} from './receiving-note/receiving-note-confirm/receiving-note-confirm.component';
import {WarehouseWarrantDetailComponent} from './warehouse-warrant/warehouse-warrant-detail/warehouse-warrant-detail.component';
import {QuitWarehouseComponent} from './warehouse-warrant/quit-warehouse/quit-warehouse.component';
import { ReturnAcceptanceComponent } from './receiving-note/return-acceptance/return-acceptance.component';

@NgModule({
  imports: [
    CommonModule,
    PurchaseInRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    DispatchBillComponent,
    DispatchBillDetailComponent,
    EditDispatchBillComponent,
    ContractComponent,
    LogisticsDeliveryComponent,
    BatchLogisticsDeliveryComponent,
    ReceivingNoteDetailComponent,
    ReceivingNoteComponent,
    ReceivingNoteConfirmComponent,
    AddReceivingNoteComponent,
    WarehouseWarrantComponent,
    WarehouseWarrantDetailComponent,
    CompactComponent,
    QuitWarehouseComponent,
    ReturnAcceptanceComponent
  ]
})
export class PurchaseInModule { }
