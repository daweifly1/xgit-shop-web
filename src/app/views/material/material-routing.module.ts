import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CarouselMaterialComponent} from './carousel-material/carousel-material.component';
import {NewsMaterialComponent} from './news-material/news-material.component';
import {NavigationMaterialComponent} from './navigation-material/navigation-material.component';
import {IndexpicMaterialComponent} from './indexpic-material/indexpic-material.component';


const routes: Routes = [
  {path: '', redirectTo: 'newsMaterial', pathMatch: 'full'},
  {path: 'carouselMaterial', component: CarouselMaterialComponent},
  {path: 'newsMaterial', component: NewsMaterialComponent},
  {path: 'navigationMaterial', component: NavigationMaterialComponent},
  {path: 'imgManage', component: IndexpicMaterialComponent}
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MaterialRoutingModule {
}
