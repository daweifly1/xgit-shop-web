import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PasswordComponent} from './password/password.component';
import {PersonalInfoComponent} from './personal-info/personal-info.component';

const routes: Routes = [
  {path: '', redirectTo: 'personalInfo', pathMatch: 'full'},
  {path: 'personalInfo', component: PersonalInfoComponent},
  {path: 'modifyPwd', component: PasswordComponent}
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class PersonalRoutingModule {
}
