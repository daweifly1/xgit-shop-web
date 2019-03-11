import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TypesComponent} from './types/types.component';
import {ManageComponent} from './manage/manage.component';
import {GoodsRoutingModule} from './goods-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';
import { EditComponent } from './types/edit/edit.component';
import { AttributeComponent } from './attribute/attribute.component';
import { ListComponent } from './attribute/list/list.component';
import { ParamListComponent } from './attribute/param-list/param-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    GoodsRoutingModule
  ],
  declarations: [TypesComponent, ManageComponent, EditComponent, AttributeComponent, ListComponent, ParamListComponent]
})
export class GoodsModule {
}
