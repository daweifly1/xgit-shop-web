import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';
import {CommonComponentModule} from '../common-component/common-component.module';

import { DemandPlanHandleRoutingModule } from './demand-plan-handle-routing.module';

import {DemandPlanComponent} from './demand-plan/demand-plan.component';
import {DemandDetailComponent} from './demand-plan/demand-detail/demand-detail.component';
import {DemandPlanLineComponent} from './demand-plan-line/demand-plan-line.component';
import {CreatePurchasePlanComponent} from './demand-plan-line/create-purchase-plan/create-purchase-plan.component';

@NgModule({
  imports: [
    CommonModule,
    DemandPlanHandleRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    CommonComponentModule
  ],
  declarations: [
    DemandPlanComponent,
    DemandDetailComponent,
    DemandPlanLineComponent,
    CreatePurchasePlanComponent
  ]
})
export class DemandPlanHandleModule { }
