import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShopsRoutingModule} from './shops-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {LayoutModule} from '../../layout/layout.module';
import {DirectivesModule} from '../../directives/directives.module';
import {GoodsComponent} from './goods/goods.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    DirectivesModule,
    ShopsRoutingModule
  ],
  declarations: [GoodsComponent]
})
export class ShopsModule {
}
