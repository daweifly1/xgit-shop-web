import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BasicInfoComponent} from './basic-info/basic-info.component';

const routes: Routes = [
  // {path: '', redirectTo: 'basicInfo', pathMatch: 'full'},
  {path: 'basicInfo', component: BasicInfoComponent},

];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CompanyInfoRoutingModule {
}
