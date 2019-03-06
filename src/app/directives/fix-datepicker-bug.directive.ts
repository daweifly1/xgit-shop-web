/**
 * 解决ng-zorror 0.7.x版本日期组件超出界面外无法选择的bug
 * */
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appFixDatepickerBug]'
})
export class FixDatepickerBugDirective {

  constructor() { }
  @HostListener('nzOnOpenChange')
  onOpen() {
    setTimeout(() => {
      window.dispatchEvent((new Event('resize')));
    });
  }
}
