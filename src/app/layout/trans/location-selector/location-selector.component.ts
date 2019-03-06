/**
 * 储位选择器表单组件，
 * */
import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {WarehouseService, WarehouseServiceNs} from '../../../core/trans/warehouse.service';
import {ShowMessageService} from '../../../widget/show-message/show-message';

export namespace LocationSelectorNs {
  export enum SelectedLevelEnum {
    Warehouse = 1,
    Area,
    Location
  }
  export interface FilterDataModel {
    code?: string;
    createDate?: any;
    delFlag?: number;
    houseLevel?: number;
    keeperName?: string;
    keeperId?: string;
    name?: string;
    pCode?: string;
    remark?: string;
    type?: number;
    updateDate?: any;
  }
}
interface TabModel {
  title: string;
  pCode: string;
  houseLevel: LocationSelectorNs.SelectedLevelEnum;
  contentList: WarehouseServiceNs.LocationDataModel[];
  selectedContent?: WarehouseServiceNs.LocationDataModel;
  selectedCode?: string;
}
const LocationSeparator = '-';

@Component({
  selector: 'app-location-selector',
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => LocationSelectorComponent)
  }]
})
export class LocationSelectorComponent implements OnInit, ControlValueAccessor {
  /**
   *显示的级别深度
   * */
  @Input()
  set depthLevel(value: LocationSelectorNs.SelectedLevelEnum) {
    if (this.singleTab) {
      this._depthLevel = LocationSelectorNs.SelectedLevelEnum.Warehouse;
    } else {
      this._depthLevel = value;
    }
  }

  /**
   * 过滤条件
   * */
  @Input() filters: LocationSelectorNs.FilterDataModel;
  /**
   * 是否可以选中中间级别
   * */
  @Input() selectedMiddle: boolean;
  /**
   * 下拉框宽度
   * */
  @Input() downBoxWidth: string;
  /**
   * 输入框占位符
   * */
  @Input() placeholder: string ;

  /**
   * 下拉框展开事件
   * true: 展开
   * false： 合拢
   * */
  @Output() expand: EventEmitter<boolean>;

  /**
   * 点击确定或是取消关闭下拉框事件
   * true: 确定
   * false：取消
   * */
  @Output() close: EventEmitter<boolean>;

  /**
   * 选择确定事件
   * */
  @Output() ok: EventEmitter<WarehouseServiceNs.LocationDataModel[]>;
  /**
   * 是否显示清除按钮,默认 true
   * */
  @Input() showClear: boolean;

  /**
   * 是否只选择一级, 为true时将忽略除filters以外的输入条件
   * */
  @Input() singleTab: boolean;
  @Input() singleTabTitle: string;

  _value: string;
  changeFn: (value: any) => void;
  tabList: TabModel[];
  disableOk: boolean;
  selectedTabIndex: number;
  private titleList: string[];
  filterData: {filters: LocationSelectorNs.FilterDataModel; pageNum: number; pageSize: number; };
  expandCtl: boolean;
  tabLoading: boolean;
  disabled: boolean;
  _depthLevel: LocationSelectorNs.SelectedLevelEnum;
  constructor(private warehouseService: WarehouseService, private messageService: ShowMessageService) {
    this.showClear = true;
    this.disabled = false;
    this.downBoxWidth = '400px';
    this.placeholder = '';
    this._depthLevel = LocationSelectorNs.SelectedLevelEnum.Location;
    this.selectedMiddle = false;
    this.tabLoading = false;
    this.expand = new EventEmitter<boolean>();
    this.close = new EventEmitter<boolean>();
    this.ok = new EventEmitter<WarehouseServiceNs.LocationDataModel[]>();
    this.tabList = [];
    this.titleList = ['选择仓库', '选择库区', '选择储位'];
    this.filterData  = {
      filters: this.filters || {},
      pageNum: 0,
      pageSize: 0
    };
    this._value = '';
    this.singleTab = false;
    this.singleTabTitle = this.titleList[0];
  }
  writeValue(value: any) {
    this._value = value;
  }
  registerOnChange(fn: any) {
    this.changeFn = fn;
  }
  registerOnTouched(fn: any) {
  }
  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }
  public onValueChange(event) {
    this.changeFn(event);
  }
  /**
   * 展开或关闭下来框事件*/
  public onExpandChange(value: boolean) {
    this.expand.emit(value);
  }
  /**
   * 激活tab事件*/
  public onTabSelect(index: number) {
    this.tabList = this.tabList.filter((item, i: number) => {
      return i <= index;
    });
    this.selectedTabIndex = index;
    this.setOkBtu();
  }
  /**
   * 设置确定按钮是否可点击
   * */
  private setOkBtu() {
    if (this.selectedMiddle) {
      this.disableOk = true;
      if (this.tabList[0].selectedCode) {
        this.disableOk = false;
      }
      return;
    }
    if (this.selectedTabIndex + 1 === this._depthLevel && this.tabList[this.selectedTabIndex].selectedCode) {
      this.disableOk = false;
    } else {
      this.disableOk = true;
    }
  }
  /**
   * 点击确定事件
   * */
  public onOk() {
    if (this.disableOk) {
      return;
    }
    const selectedList = this.tabList.map(item => item.selectedContent).filter((child) => child);

    this._value = selectedList[selectedList.length - 1].code;

    this.changeFn(this._value);
    this.ok.emit(selectedList);
    this.expandCtl = false;
  }
  /**
   * 点击取消
   * */
  public onCancel() {
    this.expandCtl = false;
  }
  public trackById(index: number, item: WarehouseServiceNs.LocationDataModel) {
    return item.id;
  }
  public trackByTitle(index: number, item: TabModel) {
    return item.title;
  }
  /**
   * 选中仓库、库区、或储位
   * */
  public onContent(tabIndex: number, item: WarehouseServiceNs.LocationDataModel) {
    this.tabList[tabIndex].selectedContent = item;
    this.tabList[tabIndex].selectedCode = item.code;
    this.setOkBtu();
    if (tabIndex + 1 >= this._depthLevel) {
      return;
    }
    this.selectedTabIndex = tabIndex + 1;
    this.tabList.push({
      pCode: item.code,
      title: this.titleList[tabIndex + 1],
      houseLevel: this.selectedTabIndex = tabIndex + 1,
      contentList: []
    });
    this.getContentList(item.code, this.selectedTabIndex + 1, this.selectedTabIndex);
  }
  /**
   * 下拉框展开*/
  expandCallback = () => {
    let codeList: string[] = [];

    if (this.singleTab) {
      this._depthLevel = LocationSelectorNs.SelectedLevelEnum.Warehouse;
      this.tabList = [{
        houseLevel: this.filters ? this.filters.houseLevel : LocationSelectorNs.SelectedLevelEnum.Warehouse,
        title: this.singleTabTitle,
        pCode: this.filters ? this.filters.pCode : '0',
        contentList: [],
        selectedContent: null,
        selectedCode: this._value
      }];
      this.getContentList(this.tabList[0].pCode, this.tabList[0].houseLevel, 0);
      this.selectedTabIndex = 0;
      return true;
    }
    if (this._value) {
      const singleList = this._value.split(LocationSeparator).reverse();
      const len = LocationSelectorNs.SelectedLevelEnum.Location >
      singleList.length ? singleList.length : LocationSelectorNs.SelectedLevelEnum.Location;

      let code = '';
      for (let i = 0; i < len; i++) {
        code = singleList[i] + (code ? LocationSeparator : '') + code;
        codeList.push(code);
      }
      if (codeList[LocationSelectorNs.SelectedLevelEnum.Location - 1]) {
        codeList[LocationSelectorNs.SelectedLevelEnum.Location - 1] = this._value;
      }
    } else {
      codeList = [undefined];
    }
    this.tabList = [];
    codeList.forEach((code: string, index: number) => {
      if (index > this._depthLevel) {
        return;
      }
      this.tabList.push({
        houseLevel: index + 1,
        title: this.titleList[index],
        pCode: index === 0 ? '0' : codeList[index - 1],
        contentList: [],
        selectedContent: null,
        selectedCode: code
      });
      this.getContentList(this.tabList[index].pCode, this.tabList[index].houseLevel, index);
    });

    this.selectedTabIndex = codeList.length - 1;
    return true;
  }
  /**
   * 获取仓库、库区、储位列表
   * @param houseLevel 储位等级，从0开始
   * */
  private getContentList(pCode: string, houseLevel: LocationSelectorNs.SelectedLevelEnum, index: number) {
    this.filterData.filters = Object.assign({}, this.filters || {});
    this.filterData.filters.pCode = pCode || this.filterData.filters.pCode;
    this.filterData.filters.houseLevel = houseLevel === undefined ? this.filterData.filters.houseLevel : houseLevel;     // 后端从1开始

    this.tabList[index].contentList = [];
    this.tabLoading = true;
    this.warehouseService.getLocationList(this.filterData).subscribe((resData: WarehouseServiceNs.UfastHttpAnyResModel) => {
      this.tabLoading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.tabList[index].contentList = resData.value.list;

      const selectedItem = this.tabList[index].contentList.find( item => item.code === this.tabList[index].selectedCode);
      if (selectedItem) {
        this.tabList[index].selectedContent = selectedItem;
      } else {
        this.tabList[index].selectedCode = undefined;
        this.tabList[index].selectedContent = null;
      }
      this.setOkBtu();
    }, (error) => {
      this.tabLoading = false;
      this.messageService.showToastMessage(error.message, 'error');
    });
  }
  ngOnInit() {
  }

}
