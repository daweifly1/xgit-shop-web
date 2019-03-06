/**
 * 根据输入为dom添加disabled样式*/
import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appEnable]'
})
export class DisabledDirective {
  @Input('appEnable')
  set appDisabled(value: boolean) {
    this.enable = value;
    this.disabledStyle = !value;
  }
  constructor() { }
  @HostBinding('class.operate-text')enable: boolean;
  @HostBinding('class.operate-text-disabled')disabledStyle: boolean;

}
