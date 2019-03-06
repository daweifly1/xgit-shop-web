import { Directive, HostListener, Input } from '@angular/core';
import { UEditorComponent } from 'ngx-ueditor';

@Directive({
  selector: '[appSetUeditor]'
})
export class SetUeditorDirective {
  @Input('appSetUeditor')
  set appSetUeditor(value: any) {
    this.uploadConfig = value;
    this.setUpload();
  }
  get appSetUeditor(): any {
    return this.uploadConfig;
  }
  private uploadConfig: any;
  private ueditor: UEditorComponent;
  constructor() {
    this.ueditor = null;
  }

  @HostListener('onReady', ['$event'])
  onReady(ueditor: UEditorComponent) {
    this.ueditor = ueditor;
    if (!this.ueditor || !this.ueditor.Instance) {
      return;
    }
    this.setUpload();
    this.ueditor.Instance.getActionUrl = function(action) {
      let path = '';
      switch (action) {
        case this.getOpt('imageActionName'):
          path = this.getOpt('imageUploadUrl');
          break;
        case this.getOpt('scrawlActionName'):
          path = this.getOpt('scrawlUploadUrl');
          break;
        case this.getOpt('snapscreenActionName'):
          path = this.getOpt('snapscreenUploadUrl');
          break;
        case this.getOpt('catcherActionName'):
          path = this.getOpt('catcherUploadUrl');
          break;
        case this.getOpt('videoActionName'):
          path = this.getOpt('videoUploadUrl');
          break;
        case this.getOpt('fileActionName'):
          path = this.getOpt('fileUploadUrl');
          break;
        default:
          path = '';
      }
      return this.getOpt('serverUrl') + path;
    };
  }
  private setUpload() {
    if (!this.ueditor || !this.ueditor.Instance) {
      return;
    }
    this.ueditor.Instance.options = this.ueditor.Instance.options || {};
    this.ueditor.Instance.options = Object.assign(this.ueditor.Instance.options, this.uploadConfig);
    this.ueditor.Instance.fireEvent('serverConfigLoaded');
  }
}
