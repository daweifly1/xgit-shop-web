import { Component, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { UfastTableNs } from '../../../../layout/layout.module';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { AbnormalOutService, AbnormalOutServiceNs } from '../../../../core/trans/abnormalOut.service';
import { Observable } from 'rxjs/Observable';
import { UnusualOut } from '../../../../../environments/printData';
import { PrintOrderTplComNs, PrintOrderTplComponent } from '../../../../layout/print-order-tpl/print-order-tpl.component';
import { LodopPrintService, LodopPrintServiceNs } from '../../../../core/infra/lodop-print.service';
import { PrintErrorService } from '../../../../widget/print-error/print-error';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { ActionCode } from '../../../../../environments/actionCode';
import { OtherWarehouseServiceNs } from '../../../../core/trans/otherwarehouse.service';
interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
}
interface ActionStatus {
  edit: boolean;
  del: boolean;
  finish: boolean;
  print: boolean;
  stockOut: boolean;
  erpSync: boolean;
}
@Component({
  selector: 'app-abnormal-out',
  styleUrls: ['./abnormal-out.component.scss'],
  templateUrl: './abnormal-out.component.html'
})
export class AbnormalOutComponent implements OnInit {
  tabPageType: TabPageType;
  selectedPage: number;
  selectedList: any[];
  selectedListIds: number[];
  tableConfig: UfastTableNs.TableConfig;
  abnormalOutDataList: AbnormalOutServiceNs.AbnormalOutDataListModel[];
  EveryLineId: string;
  @ViewChild('operation') operation: TemplateRef<any>;
  @ViewChild('abnormalNo') abnormalNo: TemplateRef<any>;
  @Input() searchText: string;
  reasonNameData: AbnormalOutServiceNs.ReasonNameDataModel[];
  searchPlaceholder: string;
  advancedSearchShow: boolean;
  filters: any;
  isVisible: boolean;
  printTpl: any;
  printShow: boolean;
  templateName: string;
  templateData: any;
  printData: PrintOrderTplComNs.DataModel;
  actionStatus: { [index: string]: ActionStatus };
  stockOut: boolean;
  barcodeFlagList: any[];
  ActionCode = ActionCode;
  constructor(private messageService: ShowMessageService,
    private abnormalOutService: AbnormalOutService, private utilService: UfastUtilService,
    private lodopService: LodopPrintService, private printErrorService: PrintErrorService) {
    this.actionStatus = {};
    this.reasonNameData = [];
    this.EveryLineId = '';
    this.selectedList = [];
    this.selectedListIds = [];
    this.abnormalOutDataList = [];
    this.searchPlaceholder = '申请单号';
    this.advancedSearchShow = false;
    this.barcodeFlagList = [
      { label: '否', value: 0 },
      { label: '是', value: 1 },
    ];
    this.filters = {};
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
    };
    this.selectedPage = this.tabPageType.ManagePage;
    this.isVisible = false;
    this.printTpl = [];
    this.printShow = false;
    this.templateName = '';
    this.templateData = '';
    this.printData = {
      config: null,
      data: [],
      printTempBdDiction: null,
      cacheHeaderFootDiction: null
    };
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    // 全选和反选
    if (value.index === -1) {
      this.selectedList = [];
      this.selectedListIds = [];
      for (let i = 0, len = this.abnormalOutDataList.length; i < len; i++) {
        this.abnormalOutDataList[i][this.tableConfig.checkRowField] = value.type ===
          UfastTableNs.SelectedChangeType.Checked ? true : false;
        if (this.abnormalOutDataList[i][this.tableConfig.checkRowField] === true) {
          this.selectedList.push(this.abnormalOutDataList[i]);
        } else if (this.abnormalOutDataList[i][this.tableConfig.checkRowField] === false) {
          this.selectedList.splice(this.selectedList.indexOf(this.abnormalOutDataList[value.index]), 1);
        }
      }
      this.selectedList.forEach((item: any) => {
        this.selectedListIds.push(item.id);
      });
      return;
    }
    // 单选和取消单选
    if (value.index !== -1) {
      if (value.type === UfastTableNs.SelectedChangeType.Checked) {
        this.selectedList.push(this.abnormalOutDataList[value.index]);
        if (this.selectedList.length === this.abnormalOutDataList.length) {
          this.tableConfig.checkAll = true;
        }
      } else {
        this.selectedList.splice(this.selectedList.indexOf(this.abnormalOutDataList[value.index]), 1);
        this.tableConfig.checkAll = false;
      }
      // 用于取出选中数组的Id用于删除
      this.selectedListIds = [];
      this.selectedList.forEach((item: any) => {
        this.selectedListIds.push(item.id);
      });
    }
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
  public doErpSync(id: string) {
    this.messageService.showAlertMessage('', '确定执行到ERP同步', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.abnormalOutService.stockOutErpSync(id).subscribe((resData: OtherWarehouseServiceNs.UfastHttpResT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getAbnormalOutList();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  // 获取列表数据
  getAbnormalOutList = (pageNum?: number) => {
    this.filters.createDateStart = this.filters.createDateStart ?
      this.utilService.getStartDate(this.filters.createDateStart) : undefined;
    this.filters.createDateEnd = this.filters.createDateEnd ?
      this.utilService.getEndDate(this.filters.createDateEnd) : undefined;
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.actionStatus = {};
    this.abnormalOutDataList = [];
    this.abnormalOutService.getAbnormalOutList(filter).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.abnormalOutDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;

      this.abnormalOutDataList.forEach((item: AbnormalOutServiceNs.AbnormalOutDataListModel) => {
        const undone = item.status === AbnormalOutServiceNs.StockOutStatus.Undone;
        this.actionStatus[item.id] = {
          edit: undone,
          print: true,
          del: undone,
          finish: item.status !== AbnormalOutServiceNs.StockOutStatus.Finish
            && item.status !== AbnormalOutServiceNs.StockOutStatus.All,
          stockOut: item.status !== AbnormalOutServiceNs.StockOutStatus.Finish &&
            item.status !== AbnormalOutServiceNs.StockOutStatus.All &&
            item.barcodeFlag === AbnormalOutServiceNs.BarcodeFlag.UnBarcode,
          erpSync: (item.status === AbnormalOutServiceNs.StockOutStatus.Finish ||
            item.status === AbnormalOutServiceNs.StockOutStatus.All) &&
            item['isSynsapSuccess'] !== OtherWarehouseServiceNs.ErpSyncFlag.Done
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 获取产生原因列表
  public getListType() {
    const data = {
      parentCode: 'OOFROMTYPE'
    };
    this.abnormalOutService.getBillTypeConfigList(data).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.reasonNameData = resData.value;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  // 高级搜索
  public advancedSearchBtn() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }

  public advancedSearchClose() {
    this.advancedSearchShow = false;
  }

  public advancedSearchReset() {
    this.filters = {};
    this.getAbnormalOutList();
  }

  // 弹框提示
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getAbnormalOutList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 结单
  public statementFinish(item: string, id: string, metrialNo?: string) {
    if (!this.actionStatus[id].finish) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.abnormalOutService.statementFinish(item, metrialNo), true);
    });
  }

  public deleteFun(ids) {
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.abnormalOutService.deleteWareHouse(ids), true);
    });
  }

  // 单条删除
  public singleDelete(id: any) {
    if (!this.actionStatus[id].del) {
      return;
    }
    this.deleteFun([id]);
  }

  // 批量删除
  public deleteWareHouse(selectedIds: string[]) {
    this.deleteFun(selectedIds);
  }

  public addWarehouse() {
    this.selectedPage = this.tabPageType.AddPage;
  }

  public editWarehouse(id: string) {
    if (!this.actionStatus[id].edit) {
      return;
    }
    this.selectedPage = this.tabPageType.EditPage;
    this.EveryLineId = id;
  }

  public detailWarehouse(id: string, stockOut: boolean) {
    if (stockOut && !this.actionStatus[id].stockOut) {
      return;
    }
    this.stockOut = stockOut;
    this.selectedPage = this.tabPageType.DetailPage;
    this.EveryLineId = id;
  }

  public onChildFinish() {
    this.getAbnormalOutList();
    this.selectedPage = this.tabPageType.ManagePage;
    this.stockOut = false;
  }

  showPrintModal(id: string): void {
    if (!this.actionStatus[id].print) {
      return;
    }
    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return;
    }
    this.isVisible = true;
    this.getPrintTpl();
    this.EveryLineId = id;
  }
  getPrintTpl = () => {
    const filter = {
      CurPage: '1',
      PageSize: '1',
      TemplateType: UnusualOut.TemplateType,
    };
    this.abnormalOutService.printTpl(filter.CurPage, filter.PageSize, filter.TemplateType).subscribe(
      (resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
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
  public getAbnormalOutDetail(btn: string) {
    this.tableConfig.loading = true;
    this.abnormalOutService.getAbnormalOutDetail(this.EveryLineId).subscribe((resData: AbnormalOutServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.printData.data = [{
        headerInfo: resData.value.headerInfo,
        dataList: resData.value.materialList
      }];
      this.printData.data[0].headerInfo.qrcode = resData.value.headerInfo.abnormalNo;
      if (btn === 'print') {
        this.lodopService.print(PrintOrderTplComponent, this.printData, 'data');
      }
      if (btn === 'preview') {
        this.lodopService.preview(PrintOrderTplComponent, this.printData, 'data');
      }
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public preview(btn: string) {
    if (this.templateName === '') {
      this.messageService.showAlertMessage('', '请选择打印模板', 'error');
      return;
    }
    this.printTpl.forEach((item) => {
      if (item.templateName === this.templateName) {
        this.printData.config = item;
      }
    });
    this.printData.printTempBdDiction = UnusualOut.printTempBdDiction;
    this.printData.cacheHeaderFootDiction = UnusualOut.cacheHeaderFootDiction;
    this.getAbnormalOutDetail(btn);

  }


  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-abnormalOut',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operation, width: 160, fixed: true },
      { title: '申请单号', tdTemplate: this.abnormalNo, width: 200 },
      { title: '产生原因', field: 'reasonName', width: 100 },
      { title: '客户', field: 'agentName', width: 100 },
      { title: '调出仓库', field: 'outLocation', width: 100 },
      { title: '出库状态', field: 'status', width: 80, pipe: 'stockOutStatus' },
      { title: '是否条码管理', field: 'barcodeFlag', width: 120, pipe: 'barcodeManage' },
      { title: '制单人', field: 'createName', width: 100 },
      { title: '制单时间', field: 'applicationDate', width: 130, pipe: 'date:yyyy-MM-dd HH:mm' },
      { title: '备注', field: 'note', width: 100 },
      { title: 'ERP同步', field: 'isSynsap', width: 80, pipe: 'erpSyncOther' },
      { title: 'ERP同步结果', field: 'isSynsapSuccess', width: 120, pipe: 'erpSyncOtherRes' },
      { title: 'ERP单号', field: 'crmOrder', width: 100 },
      ]
    };

    this.getAbnormalOutList();
    this.getListType();

  }

}
