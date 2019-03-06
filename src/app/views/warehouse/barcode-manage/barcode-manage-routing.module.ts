import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {DevanningPrintComponent} from './devanning-print/devanning-print.component';
import {PackBarcodePatchComponent} from './pack-barcode-patch/pack-barcode-patch.component';
import {PackageCodeComponent} from './package-code/package-code.component';
import {BasisCodeComponent} from './basis-code/basis-code.component';

const routes: Routes = [
  {path: '', redirectTo: 'packageCode', pathMatch: 'full'},
  {path: 'devanningPrint', component: DevanningPrintComponent},
  {path: 'packBarcodePatch', component: PackBarcodePatchComponent},
  {path: 'basisCode', component: BasisCodeComponent},
  {path: 'packageCode', component: PackageCodeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BarcodeManageRoutingModule { }
