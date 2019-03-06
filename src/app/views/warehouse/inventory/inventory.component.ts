import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ShowMessageService } from '../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
import { UfastTableNs } from '../../../layout/layout.module';
import { InventoryService, InventoryServiceNs } from '../../../core/trans/inventory.service';
import { PrintService } from '../../../core/trans/print.service';
import { Inventory } from '../../../../environments/printData';
import { PrintErrorService } from '../../../widget/print-error/print-error';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
import {ActionCode} from '../../../../environments/actionCode';
import { PrintTplSelectorService} from '../../../widget/print-tpl-selector/print-tpl-selector';
interface TabPageType {
  ManagePage: number;
  AddPage: number;
  DetailPage: number;
  CheckPage: number;
}

// 定义高级搜索所用到的字段模型
interface FilterItem {
  checkOrderNo?: string;
  createName?: string;
  status?: number;
  startDate?: any;
  endDate?: any;
}
interface ButtonState {
  start: boolean;
  close: boolean;
  del: boolean;
  check: boolean;
  print: boolean;
}
enum PrintFlag {
  Preview,
  Print
}
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  tabPageType: TabPageType;
  filters: FilterItem;
  selectedPage: number;
  selectedList: number[];
  selectedListIds: any[];
  tableConfig: UfastTableNs.TableConfig;
  inventoryDataList: any[];
  EveryLineId: string;
  chooseCheckOrderNo: string;
  dateFormat: 'yyyy-MM-dd';
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('checkOrderNo') checkOrderNo: TemplateRef<any>;

  searchPlaceholder: string;
  fullSearchShow: boolean;
  isVisible: boolean;
  printTpl: any;
  printShow: boolean;
  templateName: string;
  templateData: any;
  barcodeFlagList: any[];
  detailPage: boolean;

  buttonState: { [index: string]: ButtonState };
  ActionCode = ActionCode;
  constructor(private messageService: ShowMessageService, private utilService: UfastUtilService,
    private inventoryService: InventoryService,
    private printService: PrintService,
    private printErrorService: PrintErrorService,
    private printTplSelector: PrintTplSelectorService) {
    this.EveryLineId = '';
    this.chooseCheckOrderNo = '';
    this.selectedList = [];
    this.selectedListIds = [];
    this.inventoryDataList = [];

    this.searchPlaceholder = '盘点单号';
    this.fullSearchShow = false;
    this.filters = {};
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      DetailPage: 2,
      CheckPage: 3
    };
    this.selectedPage = this.tabPageType.ManagePage;
    this.isVisible = false;
    this.printTpl = [];
    this.printShow = false;
    this.templateName = '';
    this.templateData = '';
    this.buttonState = {};
    this.barcodeFlagList = [
      { label: '是', value: 1 },
      { label: '否', value: 0 },
    ];
    this.detailPage = true;
  }

  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.inventoryDataList.length; i < len; i++) {
      this.inventoryDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.inventoryDataList.every((item) => {
        return item._checked === true;
      });
    }
  }
  // 高级搜索
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }

  public fullSearchClose() {
    this.fullSearchShow = false;
  }

  public fullSearchReset() {
    this.filters = {};
    this.getList();
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.endDate) {
      return false;
    }
    return startDate.getTime() > this.filters.endDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.startDate) {
      return false;
    }
    return endDate.getTime() <= this.filters.startDate.getTime();
  }
  getList = () => {
    this.inventoryDataList = [];
    this.buttonState = {};
    this.tableConfig.checkAll = false;
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.startDate = this.filters.startDate ?
      this.utilService.getStartDate(this.filters.startDate) : undefined;
    this.filters.endDate = this.filters.endDate ?
      this.utilService.getEndDate(this.filters.endDate) : undefined;
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.inventoryService.getinventoryCheckList(filter).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.inventoryDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.inventoryDataList.forEach((item) => {
        this.buttonState[item.id] = {
          start: item.status === 0,
          close: item.status === 1,
          del: item.status === 0,
          check: item.status === 1 && item.barcodeFlag === 0,
          print: true
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 弹框提示
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    this.messageService.showLoading();
    observer.subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'error');
      }
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 启动盘点单
  public startInventory(item: any) {
    if (!this.buttonState[item].start) {
      return;
    }
    this.commonResDeal(this.inventoryService.startInventory(item), true);
  }

  // 关闭盘点单
  public stopInventory(item: any) {
    if (!this.buttonState[item].close) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要关闭盘点任务吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.inventoryService.stopInventory(item), true);
    });
  }

  // 删除盘点单记录
  public deleteInventory(item: any) {
    if (!this.buttonState[item].del) {
      return;
    }
    item = item.split(',');
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.inventoryService.deleteInventory(item), true);
    });
  }

  // 批量删除
  public deleteSelectInventory(selectedIds: string[]) {
    const delData = [];
    this.inventoryDataList.forEach((item) => {
      if (item._checked) {
        delData.push(item);
      }
    });
    if (delData.length === 0) {
      this.messageService.showToastMessage('请选择要删除的数据', 'warning');
      return;
    }
    const selectIds = [];
    let flag = false;
    delData.forEach((item) => {
      if (item.status === 0) {
        selectIds.push(item.id);
      } else {
        flag = true;
        return;
      }
    });
    if (flag) {
      this.messageService.showToastMessage('所选数据包含不可以删除的数据', 'warning');
      return;
    }
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.inventoryService.deleteInventory(selectIds), true);
    });
  }

  public addInventory() {
    this.selectedPage = this.tabPageType.AddPage;
  }
  public check(id: string, checkOrderNo: string) {
    this.selectedPage = this.tabPageType.CheckPage;
    this.EveryLineId = id;
    this.chooseCheckOrderNo = checkOrderNo;
    this.detailPage = false;

  }

  public detailWarehouse(id: string, checkOrderNo: string) {
    this.selectedPage = this.tabPageType.DetailPage;
    this.EveryLineId = id;
    this.chooseCheckOrderNo = checkOrderNo;
    this.detailPage = true;
  }

  public onChildFinish() {
    this.getList();
    this.selectedPage = this.tabPageType.ManagePage;
  }
  getPrintTpl = () => {
    const filter = {
      CurPage: '1',
      PageSize: '1',
      TemplateType: Inventory.TemplateType,
    };
    this.inventoryService.printTpl(filter.CurPage, filter.PageSize, filter.TemplateType).subscribe(
      (resData: InventoryServiceNs.UfastHttpResT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'warning');
        }
        this.printTpl = resData.value;
        this.printTpl.forEach((item) => {
          if (item.isDefault) { this.templateName = item.templateName; }
        });
      }, (error: any) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  public print(id) {
    this.inventoryService.getInventoryDetail(id).subscribe((resData: InventoryServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value['qrcode'] = resData.value.checkOrderNo;
      this.printTplSelector.showTplSelector({
        printConfig: Inventory,
        headerInfo: resData.value,
        dataList: resData.value.inventoryCheckDetailVOS
      });
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-inventory',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 170, fixed: true },
      { title: '盘点单号', tdTemplate: this.checkOrderNo, width: 170 },
      { title: '盘点描述', field: 'checkOrderDes', width: 150 },
      { title: '计划盘点日期', field: 'plannedDate', width: 140, pipe: 'date:yyyy-MM-dd' },
      { title: '盘点状态', field: 'status', width: 100, pipe: 'inventoryState' },
      { title: '盘点类型', field: 'checkType', width: 100, pipe: 'checkType' },
      { title: '仓库', field: 'warehouseCode', width: 100 },
      { title: '库区', field: 'locationCodesStr', width: 140 },
      { title: '是否条码管理', field: 'barcodeFlag', width: 140, pipe: 'barcodeManage' },
      { title: '启动人', field: 'startName', width: 80 },
      { title: '创建人', field: 'createName', width: 100 },
      { title: '制单时间', field: 'createDate', width: 160, pipe: 'date:yyyy-MM-dd HH:mm' },
      ]
    };
    this.getList();
  }
}
