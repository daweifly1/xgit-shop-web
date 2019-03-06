import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PickingOutRoutingModule } from './picking-out-routing.module';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import {PickingApplyComponent} from './picking-apply/picking-apply.component';

import {AddEditPickingApplyComponent} from './picking-apply/add-edit-picking-apply/add-edit-picking-apply.component';
import {PickingDeliveryComponent} from './picking-delivery/picking-delivery.component';
import {AddPickingDeliveryComponent} from './picking-delivery/add-picking-delivery/add-picking-delivery.component';
import {PickingPackageComponent} from './picking-package/picking-package.component';
import {PickingApplyConfirmComponent} from './picking-apply-confirm/picking-apply-confirm.component';
import {DetailConfirmComponent} from './picking-apply-confirm/detail-confirm/detail-confirm.component';

@NgModule({
  imports: [
    CommonModule,
    PickingOutRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    PickingApplyComponent,
    AddEditPickingApplyComponent,
    PickingDeliveryComponent,
    AddPickingDeliveryComponent,
    PickingApplyConfirmComponent,
    DetailConfirmComponent,
    PickingPackageComponent,
  ]
})
export class PickingOutModule { }
