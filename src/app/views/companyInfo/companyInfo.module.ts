import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {CommonComponentModule} from '../common-component/commonComponent.module';

import {CompanyInfoRoutingModule} from './companyInfo-routing.module';
import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {BasicInfoComponent} from './basic-info/basic-info.component';
import { QualFileComponent } from './basic-info/qual-file/qual-file.component';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    CompanyInfoRoutingModule,
    PdfViewerModule,
    CommonComponentModule
  ],
  declarations: [
    BasicInfoComponent,
    QualFileComponent
  ]
})
export class CompanyInfoModule {
}
