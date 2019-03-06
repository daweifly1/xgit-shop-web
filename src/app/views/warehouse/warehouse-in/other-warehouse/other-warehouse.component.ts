import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../layout/layout.module';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {OtherwarehouseService, OtherWarehouseServiceNs} from '../../../../core/trans/otherwarehouse.service';
import {Observable} from 'rxjs/Observable';
import {PrintTplSelectorService} from '../../../../widget/print-tpl-selector/print-tpl-selector';
import { UnusualIn } from '../../../../../environments/printData';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';
import {ActionCode} from '../../../../../environments/actionCode';
interface ActionStatus {
  edit: boolean;
  del: boolean;
  print: boolean;
  finish: boolean;
  stockIn: boolean;
  erpSync: boolean;
}
interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}

// 定义高级搜索所用到的字段模型
interface FilterItem {
  abnormalNo: string;
  inLocation: string;
  state: string;
  createName: string;
  createDateStart: string;
  createDateEnd: string;
}

@Component({
  selector: 'app-other-warehouse',
  templateUrl: './other-warehouse.component.html',
  styleUrls: ['./other-warehouse.component.scss']
})
export class OtherWarehouseComponent implements OnInit {
  tabPageType: TabPageType;
  filters: any;
  selectedPage: number;
  selectedList: number[];
  selectedListIds: any[];
  tableConfig: UfastTableNs.TableConfig;
  otherWarehouseDataList: any[];
  EveryLineId: string;
  dateFormat: 'yyyy-MM-dd';
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('abnormalNo') abnormalNo: TemplateRef<any>;

  searchPlaceholder: string;
  fullSearchShow: boolean;
  isVisible: boolean;
  printShow: boolean;
  actionStatus: {[index: string]: ActionStatus};
  stockIn: boolean;
  barcodeFlagList: any[];
  ActionCode = ActionCode;
  constructor(private messageService: ShowMessageService, private utilService: UfastUtilService,
              private otherWareHouseService: OtherwarehouseService,
              private printService: PrintTplSelectorService) {
    this.barcodeFlagList = [
      {label: '否', value: 0},
      {label: '是', value: 1},
    ];
    this.stockIn = false;
    this.EveryLineId = '';
    this.selectedList = [];
    this.selectedListIds = [];
    this.otherWarehouseDataList = [];
    this.actionStatus = {};
    this.searchPlaceholder = '申请单号';
    this.fullSearchShow = false;
    this.filters = {
      abnormalNo: '',
      inLocation: '',
      state: '',
      createName: '',
      createDateStart: '',
      createDateEnd: '',
    };
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.selectedPage = this.tabPageType.ManagePage;
    this.isVisible = false;
    this.printShow = false;
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
    if (!startDate || !this.filters.createDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.createDateEnd.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.createDateStart) {
      return false;
    }
    return endDate.getTime() <= this.filters.createDateStart.getTime();
  }
  getList = (pageNum?: number) => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.createDateStart = this.filters.createDateStart ?
      this.utilService.getStartDate(this.filters.createDateStart) : undefined;
    this.filters.createDateEnd = this.filters.createDateEnd ?
      this.utilService.getEndDate(this.filters.createDateEnd) : undefined;
    const filter = {
      pageNum: pageNum || this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.actionStatus = {};
    this.otherWarehouseDataList = [];
    this.otherWareHouseService.getWareHouseList(filter).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.otherWarehouseDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.otherWarehouseDataList.forEach((item) => {
        const finishAndAll = item.state !== OtherWarehouseServiceNs.StockInStatus.Finish &&
          item.state !== OtherWarehouseServiceNs.StockInStatus.All;
        const undone = item.state === OtherWarehouseServiceNs.StockInStatus.Undone;
        this.actionStatus[item.id] = {
          edit: undone,
          stockIn: item.barcodeFlag === OtherWarehouseServiceNs.BarcodeFlag.UnBarcode && finishAndAll,
          finish: finishAndAll,
          del: undone,
          print: true,
          erpSync: (item.state === OtherWarehouseServiceNs.StockInStatus.Finish ||
                    item.state === OtherWarehouseServiceNs.StockInStatus.All) &&
                    item.isSynsapSuccess !== OtherWarehouseServiceNs.ErpSyncFlag.Done
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 弹框提示
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 结单
  public statementFinish(id: string, billNo: string) {
    if (!this.actionStatus[id].finish) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.otherWareHouseService.statementFinish(billNo, null), true);
    });
  }
  public doErpSync(id: string) {
    this.messageService.showAlertMessage('', '确定执行到ERP同步', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.otherWareHouseService.stockInErpSync(id).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getList();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  // 删除其他入库记录
  public deleteWareHouse(item: any) {
    if (!this.actionStatus[item].edit) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.otherWareHouseService.deleteWareHouse([item]), true);
    });
  }

  // 点击选中框删除其他入库记录
  public deleteSelectWareHouse(selectedIds: string[]) {
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.otherWareHouseService.deleteWareHouse(selectedIds), true);
    });
  }

  public addWarehouse() {
    this.selectedPage = this.tabPageType.AddPage;
  }
  public toggleStockIn(id: string) {
    if (!this.actionStatus[id].stockIn) {
      return;
    }
    this.selectedPage = this.tabPageType.DetailPage;
    this.EveryLineId = id;
    this.stockIn = true;
  }
  public editWarehouse(id: string) {
    if (!this.actionStatus[id].edit) {
      return;
    }
    this.selectedPage = this.tabPageType.EditPage;
    this.EveryLineId = id;
  }

  public detailWarehouse(id: string) {
    this.selectedPage = this.tabPageType.DetailPage;
    this.EveryLineId = id;
  }

  public onChildFinish() {
    this.stockIn = false;
    this.getList();
    this.selectedPage = this.tabPageType.ManagePage;
  }

  showPrintModal(id: string): void {
    if (!this.actionStatus[id].print) {
      return;
    }

    this.tableConfig.loading = true;
    this.otherWareHouseService.getInMouseDetail(id).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      const headerInfo = resData.value.headerInfo;
      headerInfo['sapOrderDesc'] = headerInfo.sapOrder === null ? '未同步' : '已同步';
      headerInfo['voucherNODesc'] = headerInfo.voucherNO === null ? '未过账' : '已过账';
      headerInfo.qrcode = headerInfo.abnormalNo;
      this.printService.showTplSelector({
        headerInfo: headerInfo,
        dataList: resData.value.detailList,
        printConfig: UnusualIn
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }


  handleCancel(): void {
    this.isVisible = false;
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-otherWarehouse',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{title: '操作', tdTemplate: this.operation, width: 170, fixed: true},
        {title: '申请单号', tdTemplate: this.abnormalNo, width: 180},
        {title: '入库类型', field: 'type', width: 100},
        {title: '领入仓库', field: 'inLocation', width: 100},
        {title: '制单人', field: 'createName', width: 100},
        {title: '制单时间', field: 'applicationDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm'},
        {title: '入库状态', field: 'state', width: 80, pipe: 'inventoryType'},
        {title: '是否条码管理', field: 'barcodeFlag', width: 110, pipe: 'barcodeManage'},
        {title: '客户', field: 'customerName', width: 150},
        {title: 'ERP同步', field: 'isSynsap', width: 80, pipe: 'erpSyncOther'},
        {title: 'ERP同步结果', field: 'isSynsapSuccess', width: 100, pipe: 'erpSyncOtherRes'},
        {title: '原因', field: 'note', width: 100}
      ]
    };
    this.getList();
  }

}
