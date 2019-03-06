import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutModule} from '../../layout/layout.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {DirectivesModule} from '../../directives/directives.module';
import { SupplierGradeInfoComponent } from './supplier-grade-info/supplier-grade-info.component';
import { SupplierHistoryFileComponent } from './supplier-history-file/supplier-history-file.component';
import {ContractRecordComponent} from './contract-record/contract-record.component';
import { SupplierInfoRecordComponent } from './supplier-info-record/supplier-info-record.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    PdfViewerModule
  ],
  declarations: [
    SupplierGradeInfoComponent,
    SupplierHistoryFileComponent,
    ContractRecordComponent,
    SupplierInfoRecordComponent
  ],
  exports: [
    SupplierGradeInfoComponent,
    SupplierHistoryFileComponent,
    ContractRecordComponent,
    SupplierInfoRecordComponent
  ]
})
export class CommonComponentModule {
}
