import {Component, OnInit, forwardRef, OnDestroy, Output, EventEmitter, Input} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DictionaryService, DictionaryServiceNs} from '../../core/common-services/dictionary.service';
import {ShowMessageService} from '../../widget/show-message/show-message';
/**
 * 地区选择表单组件
 * ngModel: 地区六位代码，双向绑定
 * ngModelChange: 选择值改变事件
 * disabled: 设置禁用
 * detailChange: 选中值改变的详细信息
 * */
@Component({
  selector: 'app-area-selector',
  templateUrl: './area-selector.component.html',
  styleUrls: ['./area-selector.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => AreaSelectorComponent)
  }]
})
export class AreaSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  selectedList: string[];
  disabled: boolean;
  changeFn: (value: any) => void;
  areaList: any[];
  @Input() placeholder: string;
  @Output() detailChange: EventEmitter<any>;
  constructor(private dictService: DictionaryService, private messageService: ShowMessageService) {
    this.placeholder = '';
    this.disabled = false;
    this.selectedList = null;
    this.areaList = [];
    this.detailChange = new EventEmitter<any>();
  }

  public onChooseChange(list: any[]) {
    let areaDesc = '';
    list.forEach((item) => {
      areaDesc += `${item.label}/`;
    });
    const lastCode = list.length > 0 ? list[list.length - 1].value : ''
    this.detailChange.emit({
      code: lastCode,
      desc: areaDesc.substr(0, areaDesc.length  - 1),
      list: list
    });
    this.changeFn(lastCode);
  }
  writeValue(value: any) {
    this.selectedList = [];
    if (!value) {
      return;
    }
    const superCode = '000000';
    for (let i = 0; i < 3; i++) {
      const code = value.substr(0, (i + 1) * 2) + superCode.substr(0, (3 - i - 1) * 2);
      this.selectedList.push(code);
    }

  }
  registerOnChange(fn: any) {
    this.changeFn = fn;
  }
  registerOnTouched(fn: any) {}
  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }
  loadData = (node: any, index: number): PromiseLike<any> => {
    return new Promise((resolve, reject) => {
      this.dictService.getAreaList(node.value).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
        node.children = [];
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        resData.value.forEach((item: DictionaryServiceNs.AreaInfoItemModel) => {
          node.children.push({
            label: item.name,
            value: item.code,
            isLeaf: index === 1
          });
        });
        if (index <= 1 && node.children.length === 0) {
          node.children.push({
            label: node.label,
            value: node.value,
            isLeaf: index === 1
          });
        }
        resolve();
      }, (error) => {
        node.children = [];
        resolve();
        this.messageService.showToastMessage(error.message, 'error');
      });
    });
  }
  private getAreaList(children: any[], index: number, code?: string, ) {
    this.dictService.getAreaList(code).subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.forEach((item: DictionaryServiceNs.AreaInfoItemModel) => {
        const temp = {
          value: item.code,
          label: item.name,
          children: index < 3 ? [{}] : undefined,
          isLeaf: index === 3
        };
        children.push(temp);
      });
      console.log(this.areaList);
    }, (error) => {
      this.messageService.showToastMessage(error.message, 'error');
    });
  }
  ngOnInit() {
  }
  ngOnDestroy() {
  }
}
