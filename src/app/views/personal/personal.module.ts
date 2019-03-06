import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {LayoutModule} from '../../layout/layout.module';
import {PersonalRoutingModule} from './personal-routing.module';
import {PersonalInfoComponent} from './personal-info/personal-info.component';
import {PasswordComponent} from './password/password.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
    LayoutModule,
    PersonalRoutingModule,
  ],
  declarations: [
    PersonalInfoComponent,
    PasswordComponent,
  ]
})
export class PersonalModule {
}
