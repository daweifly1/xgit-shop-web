import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';
import {CommonComponentModule} from '../common-component/common-component.module';

import { PurchasePlanRoutingModule } from './purchase-plan-routing.module';

import {EquipmentProjectBudgetComponent} from './equipment-project-budget/equipment-project-budget.component';
import {BudgetDetailComponent} from './equipment-project-budget/budget-detail/budget-detail.component';
import {BudgetEditComponent} from './equipment-project-budget/budget-edit/budget-edit.component';
import { MaterialPartsPurchaseComponent } from '../purchase-plan/material-parts-purchase/material-parts-purchase.component';
import { EditMaterialPurchaseComponent
 } from '../purchase-plan/material-parts-purchase/edit-material-purchase/edit-material-purchase.component';
import { DevicePurchaseComponent } from '../purchase-plan/device-purchase/device-purchase.component';
import { EditDevicePurchaseComponent } from '../purchase-plan/device-purchase/edit-device-purchase/edit-device-purchase.component';
import {PurchasePlanComponent} from './purchase-plan-audit/purchase-plan.component';
import { PurchasePlanAllotComponent } from './purchase-plan-allot/purchase-plan-allot.component';
import { PurchasePlanExecuteComponent } from './purchase-plan-execute/purchase-plan-execute.component';
import { PurchaseExecuteWayComponent } from './purchase-plan-execute/purchase-execute-way/purchase-execute-way.component';
import { ReturnListComponent } from './return-list/return-list.component';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    PurchasePlanRoutingModule,
    CommonComponentModule
  ],
  declarations: [
    EquipmentProjectBudgetComponent,
    BudgetDetailComponent,
    BudgetEditComponent,
    MaterialPartsPurchaseComponent,
    EditMaterialPurchaseComponent,
    DevicePurchaseComponent,
    EditDevicePurchaseComponent,
    PurchasePlanComponent,
    PurchasePlanAllotComponent,
    PurchasePlanExecuteComponent,
    PurchaseExecuteWayComponent,
    ReturnListComponent
  ]
})
export class PurchasePlanModule { }
