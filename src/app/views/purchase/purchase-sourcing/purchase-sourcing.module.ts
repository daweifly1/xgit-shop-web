import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import { PurchaseSourcingRoutingModule } from './purchase-sourcing-routing.module';
import { QuotationComponent } from './quotation/quotation.component';
import { DetailQuotationComponent } from './quotation/detail-quotation/detail-quotation.component';
import { EditQuotationComponent } from './quotation/edit-quotation/edit-quotation.component';
import { InquiryComponent } from './inquiry/inquiry.component';
import { InquiryDetailComponent } from './inquiry/inquiry-detail/inquiry-detail.component';
import {CommonComponentModule} from '../common-component/common-component.module';
import { DealBidComponent } from './inquiry/deal-bid/deal-bid.component';
import { QuotaCompareComponent } from './inquiry/quota-compare/quota-compare.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    PurchaseSourcingRoutingModule,
    CommonComponentModule
  ],
  declarations: [
    QuotationComponent,
    DetailQuotationComponent,
    EditQuotationComponent,
    InquiryComponent,
    InquiryDetailComponent,
    DealBidComponent,
    QuotaCompareComponent
  ]
})
export class PurchaseSourcingModule { }
