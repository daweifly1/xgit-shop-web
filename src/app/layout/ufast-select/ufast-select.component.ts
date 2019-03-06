/**
 * placeholder<string>  提示信息              []    ''
 * ngModel<string>      select的值            [()]  ''
 * expand <boolean>      是否展开下拉框         [()]  false
 * expandHandler <()=>boolean>   展开时的回调函数       []    ()=>{return true}
 *                      返回true，则展开下拉框
 *                      必须传入箭头函数，否则无法
 *                      保存上下文
 *closeHandler<()=>boolean>     同expandHandler
 * showClear<boolean>    是否展示清除按钮       []    true
 * **/
import { Component, OnInit, Input, Output, OnDestroy, EventEmitter, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {CdkOverlayOrigin} from '@angular/cdk/overlay';
@Component({
  selector: 'app-ufast-select',
  templateUrl: './ufast-select.component.html',
  styleUrls: ['./ufast-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => UfastSelectComponent)
  }]
})
export class UfastSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() downBoxWidth: string;
  @Input()placeholder: string;
  @Input()expand: boolean;
  @Output()expandChange: EventEmitter<boolean>;
  @Input()expandHandler: () => boolean;
  @Input()closeHandler: () => boolean;
  @Input()showClear: boolean;
  @ViewChild(CdkOverlayOrigin) cdkOverlayOrigin: CdkOverlayOrigin;
  hover: boolean;
  _value: string;
  changeFn: (value: any) => void;
  disabled: boolean;
  constructor() {
    this.downBoxWidth = '100%';
    this.showClear = true;
    this.hover = false;
    this.placeholder = '';
    this._value = '';
    this.expandChange = new EventEmitter();
    this.expandHandler = () => {
      return true;
    };
    this.closeHandler = () => {
      return true;
    };
    this.expand = false;
  }
  writeValue(value: any) {
    this._value = value;
  }
  registerOnChange(fn: any) {
    this.changeFn = fn;
  }
  registerOnTouched(fn: any) {}
  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
    if (this.disabled) {
      this.expand = false;
    }
  }
  private changeExpand(value: boolean) {
    this.expand = value;
    this.expandChange.emit(value);
  }

  public onFocus() {
    if (this.disabled) {
      this.expand = false;
      return;
    }
    if (this.expand && this.closeHandler()) {
      this.changeExpand(!this.expand);
      return;
    }
    if (!this.expand && this.expandHandler()) {
      this.changeExpand(!this.expand);
      return;
    }
  }
  public onMouseenter() {
    if (!this.showClear) {
      return;
    }
    this.hover = true;
  }
  public onMouseleave() {
    if (!this.showClear) {
      return;
    }
    this.hover = false;
  }
  public onClear() {
    this._value = '';
    this.changeFn(this._value);
  }
  public onWrapClick(event: Event) {
    event.stopPropagation();
  }
  public onClickBack() {
    this.changeExpand(false);
  }
  ngOnInit() {
  }
  ngOnDestroy() {

  }
}
