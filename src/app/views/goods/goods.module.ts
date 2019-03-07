import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TypesComponent} from './types/types.component';
import {ManageComponent} from './manage/manage.component';
import {GoodsRoutingModule} from './goods-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';

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
  declarations: [TypesComponent, ManageComponent]
})
export class GoodsModule {
}
