/**
 * 根据权限码隐藏按钮
 * */
import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import {ScepterService, ScepterServiceNs} from '../core/common-services/scepter.service';
import {ShowMessageService} from '../widget/show-message/show-message';
@Directive({
  selector: '[appAuthBtu]'
})
export class AuthBtuDirective {
  @Input('appAuthBtu')
  set appAuthBtu(authId: string|number) {
    if (authId === 0) {
      this.show(true);
      return;
    }
    this.show(false);
    this.scepterService.getAuthCodes().subscribe((data: ScepterServiceNs.ScepterResModelT<ScepterServiceNs.AuthCodeObj>) => {
      if (data.code !== 0) {
        this.messageService.showAlertMessage('', data.message, 'error');
        return;
      }
      this.show(true);
      // !!data.value[authId + '']
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  constructor(private scepterService: ScepterService, private templateRef: TemplateRef<any>,
              private messageService: ShowMessageService, private viewContainerRef: ViewContainerRef) {
  }
  private show(value: boolean) {
    if (value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
