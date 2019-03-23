/**
 * 基于nz-table组件封装的组件
 * */
import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef} from '@angular/core';

export namespace UfastTableNs {
  export interface TableHeader {
    title: string;                   // 表头名称
    field?: string;                   // 字段
    pipe?: string;                    // 管道
    width: number;                    // 单元格宽度
    thTemplate?: TemplateRef<any>;    // th单元格模板
    tdTemplate?: TemplateRef<any>;    // td单元格模板
    fixed?: boolean;                  // 是否固定单元格 （只有从最左边或最右边连续固定才有效）
    tdClassList?: string[];           // 为td单元格指定类 (父组件中的类必须加上 /deep/ 前缀才能对子组件生效)
    thClassList?: string[];           // 为th单元格指定类  (父组件中的类必须加上 /deep/ 前缀才能对子组件生效)
    show?: boolean;                   // 是否显示列，false:不显示，其他：显示
    toSort?: boolean;                    // 是否可以排序
  }
  export interface TableConfig {
    showCheckbox: boolean;            // 是否展示选择列
    checkRowField?: string;           //  每行的选择字段（双向绑定）
    disabledCheckAll?: boolean;           // 是否禁用checked选中 默认不禁用
    checkRowDisabledField?: string;  // 指定每行禁用checked的绑定字段
    checkAll?: boolean;               // 全选（双向绑定）
    showPagination: boolean;          // 是否展示分页器
    pageNum?: number;                 // 当前页码，（与页面中页码双向绑定）
    pageSize?: number;                // 每一页显示的数据条数（与页面中pageSize双向绑定）
    pageSizeOptions?: number[];        // 可选的页面pageSize
    total?: number;                   // 数据总量，用于计算分页（应该从后端接口中获得）
    loading: boolean;                 // 是否显示表格加载中
    yScroll?: number;                 // y轴滚动高度
    frontPagination?: boolean;         // 是否在前端分页
    splitPage?: boolean;              // 是否分离页码选择器到底部，打开此选项表格的高度将被设为父元素的100%，
    auxDataEmitter?: EventEmitter<any>;     // 对象内部数据变动需要刷新时，发射此事件
    id?: string;                        // 用于持久化配置的id
    trClassListField?: string;        // 每一行css类名数组字段
    headers: TableHeader[];            // 列设置
    orderBy?: string;                  // 排序信息
  }
  export interface SelectedChange {     // selectedChange事件: 选中行改变事件
    type: number;       // 0:增加，1：移除
    index: number;                 // 变化数据的序号，-1：所有
    orderBy?: string;
  }
  export enum SelectedChangeType {
    Checked,
    Unchecked,
    SortChange
  }
}

interface AuxHeaderData {
  nzLeft?: string;
  nzRight?: string;
}

@Component({
  selector: 'app-ufast-table',
  templateUrl: './ufast-table.component.html',
  styleUrls: ['./ufast-table.component.scss'],
})
export class UfastTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()
  set tableConfig(value: UfastTableNs.TableConfig) {
    if (!value) {
      this._tableConfig = this.defaultConfig;
    } else {
      this._tableConfig = value;
      Object.keys(this.defaultConfig).forEach((key: string) => {
        if (this._tableConfig[key] === undefined || this._tableConfig[key] === null) {
          this._tableConfig[key] = this.defaultConfig[key];
        }
      });
    }
    if (!this._tableConfig.auxDataEmitter) {
      this._tableConfig.auxDataEmitter = new EventEmitter<any>();
    }
    if (this.auxEventReceiver) {
      this.auxEventReceiver.unsubscribe();
    }
    this.auxEventReceiver = this._tableConfig.auxDataEmitter.subscribe(() => {
      this.calcAuxData();
    });
    this.calcAuxData();
  }
  get tableConfig(): UfastTableNs.TableConfig {
    return this._tableConfig;
  }

  @Input()
  set dataList(value: any[]) {
    this._dataList = value;
  }
  get dataList(): any[] {
    return this._dataList;
  }
  /**
   * 行数据选中事件
   * */
  @Output()selectedChange: EventEmitter<UfastTableNs.SelectedChange>;
  /**
   * 获取数据函数，注意保存上下文环境*/
  @Input()getListHandle: Function;
  orderBy: string;

  tableWidth: string;
  allChecked: boolean;
  _tableConfig: UfastTableNs.TableConfig;
  _selectedList: number[];
  _dataList: any[];
  private defaultConfig: UfastTableNs.TableConfig;
  auxHeader: AuxHeaderData[];
  nzScroll: {x?: string; y?: string};
  auxEventReceiver: any;
  constructor() {
    this.nzScroll = {};
    this._dataList = [];
    this.selectedChange = new EventEmitter<UfastTableNs.SelectedChange>();
    this.allChecked = false;
    this._selectedList = [];
    this.tableWidth = '500px';
    // 配置表格
    this.defaultConfig = {
      showCheckbox: true,
      checkRowField: '_checked',
      disabledCheckAll: false,
      checkAll: false,
      showPagination: true,
      pageNum: 1,
      total: 0,
      loading: false,
      pageSize: 20,
      pageSizeOptions: [10, 20, 30, 40, 50],
      frontPagination: false,
      splitPage: false,
      trClassListField: '_trClassList',
      headers:  []
    };
    this._tableConfig = this.defaultConfig;
    this.getListHandle = () => {};
  }
  /**
   * 计算固定列*/
  private calcAuxData() {
    let leftWidth = this._tableConfig.showCheckbox ? 30 : 0,
      rightWidth = 0,
      enableFix = true;
    let sumWidth = leftWidth;

    this.auxHeader = [];
    this._tableConfig.headers.forEach((item: UfastTableNs.TableHeader, index: number) => {
      this.auxHeader.push({});
      sumWidth += item.width;
      if (item.fixed && enableFix) {
        this.auxHeader[index].nzLeft = leftWidth + 'px';
        leftWidth += item.width;
      } else {
        enableFix = false;
      }
    });

    this.tableWidth = sumWidth + 'px';
    this.nzScroll = {
      x: sumWidth + 'px',
      y: this._tableConfig.yScroll ? this._tableConfig.yScroll + 'px' : undefined
    };
    for (let i = this._tableConfig.headers.length, item: UfastTableNs.TableHeader; item = this._tableConfig.headers[--i];) {
      if (item.fixed) {
        this.auxHeader[i].nzRight = rightWidth + 'px';
        rightWidth += item.width;
      } else {
        break;
      }
    }
  }
  public onIndexChange(index: number) {
    if (index === 0) {
      return;
    }
    this.getListHandle();
  }
  public onSizeChange() {
    this.getListHandle();
  }

  public trackByTableHead(index: number, item: any) {
    return item;
  }
  public trackByTableBody(index: number, item: any) {
    return item;
  }
  public checkRowAll(value: boolean) {
    this.selectedChange.emit({
      type: value ? UfastTableNs.SelectedChangeType.Checked : UfastTableNs.SelectedChangeType.Unchecked,
      index: -1
    });
  }
  public checkRowSingle(value: boolean, selectIndex: number) {
    this.selectedChange.emit({
      type: value ? UfastTableNs.SelectedChangeType.Checked : UfastTableNs.SelectedChangeType.Unchecked,
      index: selectIndex
    });
  }
  ngOnInit() {
  }
  ngOnDestroy() {
    if (this.auxEventReceiver) {
      this.auxEventReceiver.unsubscribe();
    }
  }
  ngAfterViewInit() {
  }

  sortChang(param: any) {
    const descP = param + ' desc';
    if (this.orderBy) {
      if (this.orderBy === param) {
        this.orderBy = descP;
      } else if (this.orderBy === descP) {
        this.orderBy = '';
      } else {
        this.orderBy = param;
      }
    } else {
      this.orderBy = param;
    }
    this.selectedChange.emit({
      type: UfastTableNs.SelectedChangeType.SortChange,
      index: 3,
      orderBy: this.orderBy
    });
  }
}
