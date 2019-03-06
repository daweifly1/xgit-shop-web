import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {PrintSettingRoutingModule} from './printSetting-routing.module';
import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';
import { PrintTemplateComponent } from './print-template/print-template.component';
import { TemplateListComponent } from './print-template/template-list/template-list.component';
import { TemplateConfigComponent } from './print-template/template-config/template-config.component';
import {PrinterComponent} from './printer/printer.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    PrintSettingRoutingModule,
    LayoutModule,
    DirectivesModule
  ],
  declarations: [
    PrinterComponent,
    PrintTemplateComponent,
    TemplateListComponent,
    TemplateConfigComponent
  ]
})
export class PrintSettingModule {
}
