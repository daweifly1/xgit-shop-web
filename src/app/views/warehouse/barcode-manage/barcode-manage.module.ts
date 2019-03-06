import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BarcodeManageRoutingModule } from './barcode-manage-routing.module';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import {DevanningPrintComponent} from './devanning-print/devanning-print.component';
import {PackBarcodePatchComponent} from './pack-barcode-patch/pack-barcode-patch.component';
import {PackageCodeComponent} from './package-code/package-code.component';
import {BasisCodeComponent} from './basis-code/basis-code.component';

@NgModule({
  imports: [
    CommonModule,
    BarcodeManageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    DevanningPrintComponent,
    PackBarcodePatchComponent,
    PackageCodeComponent,
    BasisCodeComponent,
  ]
})
export class BarcodeManageModule { }
