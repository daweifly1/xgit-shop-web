import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ManageComponent} from './manage/manage.component';
import {OrdersRoutingModule} from './orders-routing.module';
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
    OrdersRoutingModule
  ],
  declarations: [ManageComponent]
})
export class OrdersModule {
}
