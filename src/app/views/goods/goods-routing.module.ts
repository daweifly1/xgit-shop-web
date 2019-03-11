import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TypesComponent} from './types/types.component';
import {ManageComponent} from './manage/manage.component';
import {AttributeComponent} from './attribute/attribute.component';


const routes: Routes = [
  {path: '', redirectTo: 'types', pathMatch: 'full'},
  {path: 'types', component: TypesComponent},
  {path: 'manage', component: ManageComponent},
  {path: 'attribute', component: AttributeComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class GoodsRoutingModule {
}
