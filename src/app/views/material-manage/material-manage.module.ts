import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MaterialManageRoutingModule} from './material-manage-routing.module';
import {MaterialModelComponent} from './material-model/material-model.component';
import {LayoutModule} from '../../layout/layout.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import { MaterialAddComponent } from './material-model/material-add/material-add.component';
import { MaterialCurrCompComponent } from './material-curr-comp/material-curr-comp.component';
import { MaterialModelExamComponent } from './material-model-exam/material-model-exam.component';
import { MaterialSettingComponent } from './material-setting/material-setting.component';
import { MaterialSettingAddComponent } from './material-setting/material-setting-add/material-setting-add.component';
import { MaterialClassComponent } from './material-class/material-class.component';
import { MaterialClassAddComponent } from './material-class/material-class-add/material-class-add.component';
import { MaterialSettingDetailComponent } from './material-setting/material-setting-detail/material-setting-detail.component';
import { EquipmentModelComponent } from './equipment-model/equipment-model.component';
import { EquipmentModelAddComponent } from './equipment-model/equipment-model-add/equipment-model-add.component';
import { MaterialReportComponent } from './material-report/material-report.component';
import {DivisionManagementComponent} from './division-management/division-management.component';
import {DivisionManagementAddComponent} from './division-management/division-management-add/division-management-add';
import { IndustrialMaterialDetailComponent } from './material-setting/industrial-material-detail/industrial-material-detail.component';
import { DirectivesModule } from '../../directives/directives.module';
import { MaterialModelExamEditComponent } from './material-model-exam/material-model-exam-edit/material-model-exam-edit.component';
import { MaterialSelectComponent } from './material-setting/material-select/material-select.component';

import {AddDivisionComponent} from './division/add-division/add-division.component';
import {DivisionComponent} from './division/division.component';
import {FactoryMaterialDetailComponent} from './industrial-material/industrial-material-detail/industrial-material-detail.component';
import {IndustrialMaterialEditComponent} from './industrial-material/industrial-material-edit/industrial-material-edit.component';
import {IndustrialMaterialEditLocationComponent
} from './industrial-material/industrial-material-edit-location/industrial-material-edit-location.component';
import {IndustrialMaterialComponent} from './industrial-material/industrial-material.component';
import {FactoryMaterialAddComponent} from './material/add-material/add-material.component';
import {MaterialEditComponent} from './material/edit-material/edit-material.component';
import {FactoryMaterialSelectComponent} from './material/material-select/material-select.component';
import {NameMatchComponent} from './material/name-match/name-match.component';
import {MaterialComponent} from './material/material.component';
import {MaterialTemplateReportAddComponent} from './material-template-report/material-template-report-add/material-template-report-add.component';
import {MaterialTemplateReportComponent} from './material-template-report/material-template-report.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    MaterialManageRoutingModule,
    DirectivesModule

  ],
  declarations: [
    MaterialModelComponent,
    MaterialAddComponent,
    MaterialCurrCompComponent,
    MaterialModelExamComponent,
    MaterialSettingComponent,
    MaterialSettingAddComponent,
    MaterialClassComponent,
    MaterialClassAddComponent,
    MaterialSettingDetailComponent,
    EquipmentModelComponent,
    EquipmentModelAddComponent,
    MaterialReportComponent,
    DivisionManagementComponent,
    DivisionManagementAddComponent,
    IndustrialMaterialDetailComponent,
    MaterialModelExamEditComponent,
    MaterialSelectComponent,
    AddDivisionComponent,
    DivisionComponent,
    FactoryMaterialDetailComponent,
    IndustrialMaterialEditComponent,
    IndustrialMaterialEditLocationComponent,
    IndustrialMaterialComponent,
    FactoryMaterialAddComponent,
    MaterialEditComponent,
    FactoryMaterialSelectComponent,
    NameMatchComponent,
    MaterialComponent,
    MaterialTemplateReportAddComponent,
    MaterialTemplateReportComponent
  ]
})
export class MaterialManageModule {
}
