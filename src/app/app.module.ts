import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';

import {CoreModule} from './core/core.module';
import {WidgetModule} from './widget/widget.module';
import {ViewsModule} from './views/views.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import {UEditorModule} from 'ngx-ueditor';

import { NZ_I18N, zh_CN } from 'ng-zorro-antd';
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NgZorroAntdModule.forRoot(),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CoreModule,
    WidgetModule,
    ViewsModule,
    UEditorModule.forRoot(<any>{
      path: 'assets/ueditor/',    // 指定ueditor.js路径目录
      options: {                  // 默认全局配置项
        themePath: '/assets/ueditor/themes/'
      }
    })
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
