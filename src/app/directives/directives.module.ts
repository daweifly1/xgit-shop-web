
import {NgModule} from '@angular/core';
import { TypeReformPipe } from './pipe/type-reform.pipe';
import { MapPipe } from './pipe/map.pipe';
import { SetUeditorDirective } from './set-ueditor.directive';
import { HtmlPipe } from './pipe/html.pipe';
import { AuthBtuDirective } from './auth-btu.directive';
import { DisabledDirective } from './disabled.directive';
import {MapListPipe} from './pipe/map-list.pipe';
import {DownloadDirective} from './download.directive';
import { SpaceChangePipe } from './pipe/space-change.pipe';
import { FixDatepickerBugDirective } from './fix-datepicker-bug.directive';

@NgModule({
  exports: [
    TypeReformPipe,
    MapPipe,
    SetUeditorDirective,
    HtmlPipe,
    MapListPipe,
    AuthBtuDirective,
    DisabledDirective,
    DownloadDirective,
    SpaceChangePipe,
    FixDatepickerBugDirective
  ],
  declarations: [
    TypeReformPipe,
    MapPipe,
    SetUeditorDirective,
    HtmlPipe,
    MapListPipe,
    AuthBtuDirective,
    DisabledDirective,
    DownloadDirective,
    SpaceChangePipe,
    FixDatepickerBugDirective
  ]
})
export class DirectivesModule {
}
