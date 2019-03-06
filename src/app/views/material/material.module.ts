import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {MaterialRoutingModule} from './material-routing.module';
import {LayoutModule} from '../../layout/layout.module';
import {UEditorModule} from 'ngx-ueditor';
import {CarouselMaterialComponent} from './carousel-material/carousel-material.component';
import {NewsMaterialComponent} from './news-material/news-material.component';
import {NavigationMaterialComponent} from './navigation-material/navigation-material.component';
import {DirectivesModule} from '../../directives/directives.module';
import {IndexpicMaterialComponent} from './indexpic-material/indexpic-material.component';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    MaterialRoutingModule,
    LayoutModule,
    DirectivesModule,
    UEditorModule
  ],
  declarations: [
    CarouselMaterialComponent,
    NewsMaterialComponent,
    NavigationMaterialComponent,
    IndexpicMaterialComponent
  ]
})
export class MaterialModule {
}
