import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegistrationAuditComponent} from './registration-audit/registration-audit.component';
import {ArchivesManageComponent} from './archives-manage/archives-manage.component';
import {RecommendAuditComponent} from './recommend-audit/recommend-audit.component';
import {ModifyAuditComponent} from './modify-audit/modify-audit.component';
import {FactoryArchivesManageComponent} from './factory-archives-manage/factory-archives-manage.component';
import {ReviewFileComponent} from './review-file/review-file.component';
import {LurkingSupplierComponent} from './lurking-supplier/lurking-supplier.component';
const routes: Routes = [
  // {path: '', redirectTo: 'registrationAudit', pathMatch: 'full'},
  {path: 'archivesManage', component: ArchivesManageComponent},
  {path: 'recommendAudit', component: RecommendAuditComponent},
  {path: 'registrationAudit', component: RegistrationAuditComponent},
  {path: 'modifyAudit', component: ModifyAuditComponent},
  {path: 'factoryArchivesManage', component: FactoryArchivesManageComponent},
  {path: 'reviewFile', component: ReviewFileComponent},
  {path: 'lurkingSupplier', component: LurkingSupplierComponent},
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class SupplierRoutingModule {
}
