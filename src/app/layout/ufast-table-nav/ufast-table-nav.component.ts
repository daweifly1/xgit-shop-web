/**
 * app-ufast-table组件上的导航条组件
 * */
import { Component, OnInit, Input, Output, TemplateRef, EventEmitter } from '@angular/core';
import {UfastTableNs} from '../ufast-table/ufast-table.component';
import {UserServiceNs} from '../../core/common-services/user.service';
import {DictionaryService, DictionaryServiceNs} from '../../core/common-services/dictionary.service';
import {ShowMessageService} from '../../widget/show-message/show-message';
@Component({
  selector: 'app-ufast-table-nav',
  templateUrl: './ufast-table-nav.component.html',
  styleUrls: ['./ufast-table-nav.component.scss']
})
export class UfastTableNavComponent implements OnInit {
  /**
   * 搜索输入框提示文字
   * */
  @Input() searchPlaceholder: string;
  /**
   * 左侧模板
   * */
  @Input() leftTemplate: TemplateRef<any>;
  /**
   * 右侧模板
   * */
  @Input() rightTemplate: TemplateRef<any>;
  /**
   * 搜索按钮点击事件
   * */
  @Output() search: EventEmitter<any>;
  /**
   * 高级搜索按钮点击事件
   * */
  @Output() advancedSearch: EventEmitter<any>;
  /**
   * 刷新按钮点击事件
   * */
  @Output() refresh: EventEmitter<any>;
  /**
   * 是否显示高级搜索按钮
   * 默认: true
   * */
  @Input() showAdvancedSearch: boolean;
  /**
   * 是否显示普通搜索
   * 默认：true
   */
  @Input() showSearch: boolean;
  /**
  * 是否显示刷新按钮
   * 默认：true
   * */
  @Input() showRefresh: boolean;
  /**
   * 表格配置参数
   * */
  @Input()
  set tableConfig(value: UfastTableNs.TableConfig) {
    if (!value) {
      this._tableHeader = null;
      this._tableConfig = null
      return;
    }
    if (!value.auxDataEmitter) {
      value.auxDataEmitter = new EventEmitter<any>();
    }
    this.tableEmitter = value.auxDataEmitter;
    this._tableHeader = value.headers;

    this._tableConfig = value;
    if (this._tableHeader) {
      this._tableHeader.forEach((item: UfastTableNs.TableHeader) => {
        item.show = item.show !== false ? true : false;
      });
    }
    this.copyHeaders(this._tableHeader, this.latestTableHeaders);
  }
  /**
   * 搜索框值双向绑定
   * */
  @Input()
  set searchText(value: string) {
    this._searchText = value;
  }
  get searchText(): string {
    return this._searchText;
  }
  @Output() searchTextChange: EventEmitter<string>;

  _searchText: string;
  _tableHeader: UfastTableNs.TableHeader[];
  showTableConfig: boolean;
  _tableConfig: UfastTableNs.TableConfig;
  private tableEmitter: EventEmitter<any>;
  latestTableHeaders: UfastTableNs.TableHeader[];
  tableId: string;
  saveColFieldList: string[];
  constructor(private basicService: DictionaryService, private messageService: ShowMessageService) {
    this.showTableConfig = false;
    this._tableHeader = null;
    this.searchPlaceholder = '';
    this._searchText = '';
    this.leftTemplate = null;
    this.rightTemplate = null;
    this.advancedSearch = new EventEmitter<any>();
    this.search = new EventEmitter<any>();
    this.refresh = new EventEmitter<any>();
    this.searchTextChange = new EventEmitter<string>();
    this.showAdvancedSearch = true;
    this.showRefresh = true;
    this.showSearch = true;
    this.latestTableHeaders = [];
    this.saveColFieldList = ['title', 'fixed', 'show'];   // 每一列保存到数据库中的字段

  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public onFullSearch() {
    this.advancedSearch.emit();
  }
  public searchChange(value: string) {
    this.searchTextChange.emit(value);
  }
  public onSearch() {
    this.search.emit();
  }
  public onRefresh() {
    this.refresh.emit();
  }
  public onTableConfig(event: Event) {
    event.stopPropagation();
    this.showTableConfig = !this.showTableConfig;
  }
  public moveUp(index: number) {
    if (index <= 0) {
      return;
    }
    this.latestTableHeaders.splice(index - 1, 0, this.latestTableHeaders.splice(index, 1)[0]);
    if (this.latestTableHeaders[index].fixed && !this.latestTableHeaders[index - 1].fixed) {
      this.latestTableHeaders[index - 1].fixed = true;
    }
  }
  public moveDown(index: number) {
    if (index >= this.latestTableHeaders.length - 1) {
      return;
    }
    this.latestTableHeaders.splice(index + 1 , 0, this.latestTableHeaders.splice(index, 1)[0]);
    if (!this.latestTableHeaders[index].fixed && this.latestTableHeaders[index + 1].fixed) {
      this.latestTableHeaders[index + 1].fixed = false;
    }
  }
  public onFixedChange(value: boolean, index: number) {
    let fixedI = 0;
    for (const len = this.latestTableHeaders.length; fixedI < len; fixedI++) {
      if (!this.latestTableHeaders[fixedI].fixed) {
        break;
      }
    }
    this.latestTableHeaders[index].fixed = value;
    if (index !== fixedI) {
      if (value) {
        this.latestTableHeaders.splice(fixedI, 0, this.latestTableHeaders.splice(index, 1)[0]);
      } else {
        this.latestTableHeaders.splice(fixedI - 1, 0, this.latestTableHeaders.splice(index, 1)[0]);
      }
    }
  }
  /**
   * 提交配置
   * */
  public submitConfig() {
    this.copyHeaders(this.latestTableHeaders, this._tableHeader);

    const tempConfig: UfastTableNs.TableConfig = <any>{};
    Object.keys(this._tableConfig).forEach((key: string) => {
      if (typeof this._tableConfig[key] !== 'object') {       // 去除如tdTemplate等字段
        tempConfig[key] = this._tableConfig[key];
      }
    });
    tempConfig.headers = [];
    this._tableHeader.forEach((item, index: number) => {
      tempConfig.headers[index] = <any>{};
      Object.keys(item).forEach((key: string) => {
        if (typeof item[key] !== 'object') {
          tempConfig.headers[index][key] = item[key];
        }
      });
    });
    this.tableEmitter.emit();     // 发射表格配置修改事件
    this.messageService.showLoading('');
    this.basicService.setTableConfig({id: this.tableId, tableCol: JSON.stringify(tempConfig), tableName: this._tableConfig.id})
      .subscribe((resData: DictionaryServiceNs.UfastHttpAnyResModel) => {
        this.messageService.closeLoading();
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          return;
        }
        this.messageService.showToastMessage('操作成功', 'success');
        this.showTableConfig = false;
        if (!this.tableId) {
          this.getConfig();
        }
      }, (error) => {
        this.messageService.showAlertMessage('', error.message, 'error');
        this.messageService.closeLoading();
      });
  }
  /**
   * 取消配置
   * */
  public cancelConfig() {
    this.copyHeaders(this._tableHeader, this.latestTableHeaders);
    this.showTableConfig = false;
  }
  public showColChange(value: boolean, header: UfastTableNs.TableHeader) {
    if (!value) {
      header.fixed = false;
    }
  }
  private copyHeaders(source: UfastTableNs.TableHeader[], target: UfastTableNs.TableHeader[]) {
    target.length = 0;
    source.forEach((item) => {
      target.push(Object.assign({}, item));
    });
  }
  private getConfig() {
    this.basicService.getTableConfig(this._tableConfig.id).subscribe((resData: UserServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0 || !resData.value) {
        return;
      }
      this.tableId = resData.value.id;
      const tableConfig: UfastTableNs.TableConfig = JSON.parse(resData.value.tableCol);
      if (!tableConfig || !tableConfig.headers) {
        return;
      }
      this.latestTableHeaders.length = 0;
      tableConfig.headers.forEach((item: UfastTableNs.TableHeader) => {
        const nowHead = this._tableHeader.find(head => head.title === item.title);
        if (!nowHead) {   // 过滤代码不包含的列
          return;
        }
        item.show = item.show !== false ? true : false;
        const headerIndex: number = this.latestTableHeaders.length;
        this.latestTableHeaders[headerIndex] = Object.assign({}, nowHead);
        // 取出指定字段
        this.saveColFieldList.forEach((key) => {
          this.latestTableHeaders[headerIndex][key] = item[key];
        });
      });
      /**查找代码中新增的列*/
      this._tableHeader.forEach((item: UfastTableNs.TableHeader, index: number) => {
        const newHead = this.latestTableHeaders.find(head => head.title === item.title);
        if (newHead) {
          return;
        }
        item.show = item.show !== false ? true : false;
        this.latestTableHeaders.splice(index, 0, Object.assign({}, item));
      });
      this._tableHeader.length = 0;
      this.copyHeaders(this.latestTableHeaders, this._tableHeader);
      this.tableEmitter.emit();
    }, (error) => {
    });
  }
  ngOnInit() {
    if (!this._tableConfig || !this._tableConfig.id) {
      return;
    }
    this.getConfig();
  }

}
