import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GoodsComponent} from './goods/goods.component';


const routes: Routes = [
  {path: '', redirectTo: 'goods', pathMatch: 'full'},
  {path: 'goods', component: GoodsComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ShopsRoutingModule {
}
