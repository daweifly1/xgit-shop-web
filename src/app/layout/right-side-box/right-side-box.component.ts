/**
 * 右侧边栏
 *    属性                 描述                        类型             默认
 * width<number>           宽度（px）                 [width]           350px
 * title<string>           标题                       [title]            ''
 * otherClose<boolean>     点击其他区域是否关闭        [otherClose]       true
 * show<boolean>            是否显示                   [(show)]           false
 * close                    关闭事件                    (close)           ---
 * **/
import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'app-right-side-box',
  templateUrl: './right-side-box.component.html',
  styleUrls: ['./right-side-box.component.scss']
})
export class RightSideBoxComponent {
  @Input()width: number;
  @Input()title: string;
  @Input()
  set otherClose(value: boolean) {
    this._otherClose = value;
  }
  get otherClose(): boolean {
    return this._otherClose;
  }
  @Output()close: EventEmitter<any>;
  @Input()
  set show(value: boolean) {
    this._show = value;
  }
  get show(): boolean {
    return this._show;
  }
  @Output() showChange: EventEmitter<boolean>;
  _show: boolean;
  _otherClose: boolean;
  constructor(private elementRef: ElementRef) {
    this.close = new EventEmitter();
    this.showChange = new EventEmitter();
    this.otherClose = true;
    this._show = false;
    this.title = '标题';
    this.width = 350;
  }
  public onClose() {
    this._show = false;
    this.showChange.emit(this._show);
    this.close.emit();
  }
  public onMask() {
    if (this._otherClose) {
      this.onClose();
    }
  }
  public onContent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
}
