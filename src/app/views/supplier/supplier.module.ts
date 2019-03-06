import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {SupplierRoutingModule} from './supplier-routing.module';
import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {CommonComponentModule} from '../common-component/commonComponent.module';
import { RegistrationAuditComponent } from './registration-audit/registration-audit.component';
import { SupplierDetailComponent } from './supplier-detail/supplier-detail.component';
import { RecommendSupplierrComponent } from './recommend-supplierr/recommend-supplierr.component';
import { ArchivesManageComponent } from './archives-manage/archives-manage.component';
import { RecommendAuditComponent } from './recommend-audit/recommend-audit.component';
import { ModifyAuditComponent } from './modify-audit/modify-audit.component';
import { SupplierEditComponent } from './supplier-edit/supplier-edit.component';
import { ModifyDetailComponent } from './modify-audit/modify-detail/modify-detail.component';
import { SupplierBasicInfoDetailComponent } from './component/supplier-basic-info-detail/supplier-basic-info-detail.component';
import { SupplierContactDetailComponent } from './component/supplier-contact-detail/supplier-contact-detail.component';
import { FactoryArchivesManageComponent } from './factory-archives-manage/factory-archives-manage.component';
import { SupplierQualfileDetailComponent } from './component/supplier-qualfile-detail/supplier-qualfile-detail.component';
import { ReviewFileComponent } from './review-file/review-file.component';
import { ProblemRecordComponent } from './supplier-edit/problem-record/problem-record.component';
import { SelectSelfSupplierComponent } from './factory-archives-manage/select-self-supplier/select-self-supplier.component';
import { LurkingSupplierComponent } from './lurking-supplier/lurking-supplier.component';
import { RecommendInfoComponent } from './recommend-audit/recommend-info/recommend-info.component';
import { ArchivesImportFileComponent } from './component/archives-import-file/archives-import-file.component';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    SupplierRoutingModule,
    PdfViewerModule,
    CommonComponentModule
  ],
  declarations: [
    RegistrationAuditComponent,
    SupplierDetailComponent,
    RecommendSupplierrComponent,
    ArchivesManageComponent,
    RecommendAuditComponent,
    ModifyAuditComponent,
    SupplierEditComponent,
    ModifyDetailComponent,
    SupplierBasicInfoDetailComponent,
    SupplierContactDetailComponent,
    FactoryArchivesManageComponent,
    SupplierQualfileDetailComponent,
    ReviewFileComponent,
    ProblemRecordComponent,
    SelectSelfSupplierComponent,
    LurkingSupplierComponent,
    RecommendInfoComponent,
    ArchivesImportFileComponent
  ]
})
export class SupplierModule {
}
