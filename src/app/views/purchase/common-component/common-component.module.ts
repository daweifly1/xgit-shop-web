import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LayoutModule} from '../../../layout/layout.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {DirectivesModule} from '../../../directives/directives.module';
import {OverlayModule} from '@angular/cdk/overlay';

import { DetailDevicePurchaseComponent } from './detail-device-purchase/detail-device-purchase.component';
import { DetailMaterialPurchaseComponent } from './detail-material-purchase/detail-material-purchase.component';
import { EditContractComponent} from './edit-contract/edit-contract.component';
import { PurchaseStepsComponent } from './purchase-steps/purchase-steps.component';
import { DetailContractComponent } from './detail-contract/detail-contract.component';
import { SelectClauseComponent } from './select-clause/select-clause.component';
import { SelectClauseService } from './select-clause/select-clause.component';
import {NewApprovalFormComponent} from './new-approval-form/new-approval-form.component';
import {NewAskPriceComponent} from './new-ask-price/new-ask-price.component';
import {EditContractClauseComponent} from './edit-contract-clause/edit-contract-clause.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    PdfViewerModule,
    OverlayModule
  ],
  declarations: [
    DetailDevicePurchaseComponent,
    DetailMaterialPurchaseComponent,
    EditContractComponent,
    PurchaseStepsComponent,
    DetailContractComponent,
    SelectClauseComponent,
    NewApprovalFormComponent,
    NewAskPriceComponent,
    EditContractClauseComponent
  ],
  exports: [
    DetailDevicePurchaseComponent,
    DetailMaterialPurchaseComponent,
    EditContractComponent,
    PurchaseStepsComponent,
    DetailContractComponent,
    NewApprovalFormComponent,
    NewAskPriceComponent,
    EditContractClauseComponent
  ],
  providers: [
    SelectClauseService
  ],
  entryComponents: [
    SelectClauseComponent,
  ]
})
export class CommonComponentModule { }
