/**
 * 右侧表格组件，可与外部联动
 * */
import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  TemplateRef
} from '@angular/core';
import {UfastTableNs, UfastTableComponent} from '../ufast-table/ufast-table.component';

export namespace RightSideTableBoxNs {
  export interface SelectedChange<T> extends UfastTableNs.SelectedChange {
    list: T[];
  }
  export interface SelectedChangeEvent {
    type: SelectedChangeType;
    idList: any[];
    all: boolean;
    updateOrigin?: boolean;
  }
  export enum  SelectedChangeType {
    Checked,
    Unchecked
  }
}

/**
 * 右边栏表格组件
 */
@Component({
  selector: 'app-right-side-table-box',
  templateUrl: './right-side-table-box.component.html',
  styleUrls: ['./right-side-table-box.component.scss']
})
export class RightSideTableBoxComponent implements OnInit, OnDestroy {
  /**
   * 表格头部模板
   * */
  @Input() topTpl: TemplateRef<any>;
  /**
   * 表格配置
   * */
  @Input() tableConfig: UfastTableNs.TableConfig;
  /**
   * 默认搜索框内容可双向绑定*/
  @Input() searchContent: string;
  @Output() searchContentChange: EventEmitter<string>;

  /**
   * 默认搜索框提示信息*/
  @Input() searchPlaceholder: string;
  /**
   * 搜索按钮事件*/
  @Output() search: EventEmitter<any>;
  /**
   * 表格行选中事件*/
  @Output() selectedChange: EventEmitter<RightSideTableBoxNs.SelectedChange<any>>;
  /**
   * 获取列表数据函数*/
  @Input() getListHandle: Function;
  /**
   * 组件外部改变选中数据行的事件
   * */
  @Input() selectedChangeEvent: EventEmitter<RightSideTableBoxNs.SelectedChangeEvent> ;
  /**
   * 标识行数据的字段
   * */
  @Input() idFiled: string;
  /**
   * 列表数据*/
  @Input()
  set dataList(value: any[]) {

    this._dataList = value;
    if (this.eventData) {
      this.changeCheck(this.eventData);
      this.eventData = null;
    }
  }
  get dataList(): any[] {
    return this._dataList;
  }
  /**
   * box宽度*/
  @Input()width: number;
  /**
   * 标题*/
  @Input()title: string;
  /**
   * 是否点击其它区域关闭box*/
  @Input()
  set otherClose(value: boolean) {
    this._otherClose = value;
  }
  get otherClose(): boolean {
    return this._otherClose;
  }
  /**
   * 关闭box事件
   * */
  @Output()close: EventEmitter<any>;
  /**
   * 打开关闭box，可双向绑定
   * */
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
  _dataList: any[];
  checkedObj: {[index: string]: boolean};
  eventData: RightSideTableBoxNs.SelectedChangeEvent;
  private selectedChange$: any;
  constructor(private elementRef: ElementRef, private cdRef: ChangeDetectorRef) {
    this.searchContentChange = new EventEmitter();
    this.search = new EventEmitter();
    this.close = new EventEmitter();
    this.selectedChange = new EventEmitter();
    this.showChange = new EventEmitter();
    this.otherClose = true;
    this._show = false;
    this.title = '标题';
    this.width = 350;
    this.checkedObj = {};
    this._dataList = [];
    this.topTpl = null;
  }

  onBodyClick = () => {
    this.onClose();
  }
  public onInputChange(event: string) {
    this.searchContent = event;
    this.searchContentChange.emit(event);
  }
  public searchList() {
    this.search.emit();
  }
  public onSelectedChange(event: UfastTableNs.SelectedChange) {
    if (this._dataList.length === 0) {
      this.tableConfig.checkAll = false;
      return;
    }
    const changeData: RightSideTableBoxNs.SelectedChange<any[]> = {
      index: event.index,
      type: event.type,
      list: []
    };
    if (event.index === -1) {
      if (event.type === UfastTableNs.SelectedChangeType.Checked) {
        this._dataList.filter(item => !item[this.tableConfig.checkRowField]).forEach((item) => {
          item[this.tableConfig.checkRowField] = true;
          changeData.list.push(Object.assign({}, item));
        });
      } else {
        this._dataList.filter(item => item[this.tableConfig.checkRowField]).forEach((item) => {
          item[this.tableConfig.checkRowField] = false;
          changeData.list.push(Object.assign({}, item));
        });
      }
    } else {
      changeData.list.push(Object.assign({}, this._dataList[event.index]));
      if (event.type === UfastTableNs.SelectedChangeType.Checked) {
        this.tableConfig.checkAll = this._dataList.length === 0 ? false : true;
        for (let i = 0, len = this._dataList.length; i < len; i++) {
          if (!this._dataList[i][this.tableConfig.checkRowField]) {
            this.tableConfig.checkAll = false;
            break;
          }
        }
      } else {
        this.tableConfig.checkAll = false;
      }
    }
    this.selectedChange.emit(changeData);
  }
  public onContent(event: Event) {
    event.stopPropagation();
    event.preventDefault();
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
  private changeCheck(event: RightSideTableBoxNs.SelectedChangeEvent) {
    if (this._dataList.length === 0) {
      this.tableConfig.checkAll = false;
      return;
    }
    if (event.all) {
      this.tableConfig.checkAll = event.type === RightSideTableBoxNs.SelectedChangeType.Checked ? true : false;
      this._dataList.forEach((item) => {
        item[this.tableConfig.checkRowField] = this.tableConfig.checkAll;
      });
      return;
    }
    this.tableConfig.checkAll = true;
    if (event.type === RightSideTableBoxNs.SelectedChangeType.Checked) {
      event.idList.forEach((item: any) => {
        const checkItem = this._dataList.find(value => value[this.idFiled] === item);
        if (checkItem) {
          checkItem[this.tableConfig.checkRowField] = true;
        }
      });
      const unCheckIetm = this._dataList.find(itemData => !itemData[this.tableConfig.checkRowField]);
      this.tableConfig.checkAll = unCheckIetm ? false : this.tableConfig.checkAll;
    } else {
      this.tableConfig.checkAll = false;
      event.idList.forEach((item: any) => {
        const value = this._dataList.find(itemData => itemData[this.idFiled] === item);
        if (value) {
          value[this.tableConfig.checkRowField] = false;
        }
      });
    }
  }
  ngOnInit() {
    /**
     * 订阅业务组件的事件
     */
    this.selectedChange$ = this.selectedChangeEvent.subscribe((event: RightSideTableBoxNs.SelectedChangeEvent) => {
      if (event.updateOrigin) {
        this.eventData = Object.assign({}, event);
      } else {
        this.changeCheck(event);
      }
    });
  }
  ngOnDestroy() {
    if (this.selectedChange$) {
      this.selectedChange$.unsubscribe();
    }
  }
}
