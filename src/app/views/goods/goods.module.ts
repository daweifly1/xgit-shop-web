import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TypesComponent} from './types/types.component';
import {ManageComponent} from './manage/manage.component';
import {GoodsRoutingModule} from './goods-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';
import {AttributeComponent} from './attribute/attribute.component';
import {ListComponent} from './attribute/list/list.component';
import {ParamListComponent} from './attribute/param-list/param-list.component';
import {EditGoodsComponent} from './manage/edit-goods/edit-goods.component';
import {EditTypeComponent} from './types/edit-type/edit-type.component';
import {UEditorModule} from 'ngx-ueditor';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    UEditorModule,
    GoodsRoutingModule
  ],
  declarations: [TypesComponent, ManageComponent, EditTypeComponent, AttributeComponent,
    ListComponent, ParamListComponent, EditGoodsComponent]
})
export class GoodsModule {
}
