import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {PickingDeliveryComponent} from './picking-delivery/picking-delivery.component';
import {PickingApplyComponent} from './picking-apply/picking-apply.component';
import {PickingPackageComponent} from './picking-package/picking-package.component';
import {PickingApplyConfirmComponent} from './picking-apply-confirm/picking-apply-confirm.component';

const routes: Routes = [
  {path: '', redirectTo: 'pickingApply', pathMatch: 'full'},
  {path: 'pickingApply', component: PickingApplyComponent},
  {path: 'pickingDelivery', component: PickingDeliveryComponent},
  {path: 'pickingAcknowledgement', component: PickingApplyConfirmComponent},
  {path: 'pickingPackage', component: PickingPackageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PickingOutRoutingModule { }
