import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {LayoutModule} from '../../../layout/layout.module';
import {DirectivesModule} from '../../../directives/directives.module';

import { ClauseRoutingModule } from './clause-routing.module';
import { ClauseListComponent } from './clause-list/clause-list.component';
import { DetailClauseComponent } from './clause-list/detail-clause/detail-clause.component';
import { EditClauseComponent } from './clause-list/edit-clause/edit-clause.component';
import { ContractClauseTemplateComponent } from './contract-clause-template/contract-clause-template.component';
import { AddClauseTemplateComponent } from './contract-clause-template/add-clause-template/add-clause-template.component';

@NgModule({
  imports: [
    CommonModule,
    ClauseRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
  ],
  declarations: [
    ClauseListComponent,
    DetailClauseComponent,
    EditClauseComponent,
    ContractClauseTemplateComponent,
    AddClauseTemplateComponent
  ]
})
export class ClauseModule { }
