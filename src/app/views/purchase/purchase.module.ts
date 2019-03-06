import { ContractDetailComponent } from './purchase-contract/contract-detail/contract-detail.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';
import {PurchaseRoutingModule} from './purchase-routing.module';
import { PurchaseContractComponent } from './purchase-contract/purchase-contract.component';
import { CommonComponentModule } from './common-component/common-component.module';
import { PurchaseConfirmationComponent } from './purchase-confirmation/purchase-confirmation.component';
import { DetailConfirmationComponent } from './purchase-confirmation/detail-confirmation/detail-confirmation.component';
import { EditConfirmationComponent } from './purchase-confirmation/edit-confirmation/edit-confirmation.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PurchaseRoutingModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    CommonComponentModule
  ],
  declarations: [
  PurchaseContractComponent,
  PurchaseConfirmationComponent,
  DetailConfirmationComponent,
  EditConfirmationComponent,
  ContractDetailComponent
]
})
export class PurchaseModule {
}
