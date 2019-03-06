import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PrinterComponent} from './printer/printer.component';
import { PrintTemplateComponent } from './print-template/print-template.component';
const routes: Routes = [
    {path: '', redirectTo: 'printer', pathMatch: 'full'},
    {path: 'printer', component: PrinterComponent},
    {path: 'printTemplate', component: PrintTemplateComponent}
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class PrintSettingRoutingModule {
}
