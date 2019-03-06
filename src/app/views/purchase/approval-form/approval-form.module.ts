import { LineAuditDetailComponent } from './approval-line-audit/line-audit-detail/line-audit-detail.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import { ApprovalFormRoutingModule } from './approval-form-routing.module';

import {NegotiationPlanComponent} from './negotiation-plan/negotiation-plan.component';
import {AddNegotiationPlanComponent} from './negotiation-plan/add-negotiation-plan/add-negotiation-plan.component';
import {DetailNegotiationPlanComponent} from './negotiation-plan/detail-negotiation-plan/detail-negotiation-plan.component';
import { ApprovalFormListComponent } from './approval-form-list/approval-form-list.component';
import { ApprovalFormDetailComponent } from './approval-form-list/approval-form-detail/approval-form-detail.component';
import {CommonComponentModule} from '../common-component/common-component.module';
import { DealPriceComponent } from './approval-form-list/deal-price/deal-price.component';
import { ApprovalLineAuditComponent } from './approval-line-audit/approval-line-audit.component';
import { NegotiationMinutesComponent } from './negotiation-minutes/negotiation-minutes.component';
import { AddNegotiationMinutesComponent } from './negotiation-minutes/add-negotiation-minutes/add-negotiation-minutes.component';
import { DetailNegotiationMinutesComponent } from './negotiation-minutes/detail-negotiation-minutes/detail-negotiation-minutes.component';

@NgModule({
  imports: [
    CommonModule,
    ApprovalFormRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    CommonComponentModule
  ],
  declarations: [
    NegotiationPlanComponent,
    AddNegotiationPlanComponent,
    DetailNegotiationPlanComponent,
    ApprovalFormListComponent,
    ApprovalFormDetailComponent,
    DealPriceComponent,
    ApprovalLineAuditComponent,
    NegotiationMinutesComponent,
    AddNegotiationMinutesComponent,
    DetailNegotiationMinutesComponent,
    LineAuditDetailComponent
  ]
})
export class ApprovalFormModule { }
