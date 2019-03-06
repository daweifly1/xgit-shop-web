import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RoleManageComponent} from './role-manage/role-manage.component';
import {UserManageComponent} from './user-manage/user-manage.component';
import {DeptManageComponent} from './dept-manage/dept-manage.component';
import { DictionaryComponent } from './dictionary/dictionary.component';
import {CopperCompanyComponent} from './copper-company/copper-company.component';
import { UserLeaveComponent } from './user-leave/user-leave.component';
import {AuthComponent} from './auth/auth.component';
import {AuthRoleManageComponent} from './auth-role-manage/auth-role-manage.component';

const routes: Routes = [
  {path: '', redirectTo: 'roleManage', pathMatch: 'full'},
  {path: 'roleManage', component: RoleManageComponent},
  {path: 'userManage', component: UserManageComponent},
  {path: 'deptManage', component: DeptManageComponent},
  {path: 'dictionary', component: DictionaryComponent},
  {path: 'printSetting', loadChildren: './printSetting/printSetting.module#PrintSettingModule'},
  {path: 'copperCompany', component: CopperCompanyComponent},
  {path: 'authManage', component: AuthComponent},
  {path: 'authRoleManage', component: AuthRoleManageComponent},
  {path: 'copperCompany', component: CopperCompanyComponent},
  {path: 'userLeave', component: UserLeaveComponent}
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class InternalRoutingModule {
}
