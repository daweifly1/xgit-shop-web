import { Component, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { PurchaseOutService, PurchaseOutServiceNs } from '../.././../../core/trans/purchase-out.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/layout.module';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { Observable } from 'rxjs/Observable';
import { PrintTplSelectorService } from '../../../../widget/print-tpl-selector/print-tpl-selector';
import { ReturnApply } from '../../../../../environments/printData';
import { ActionCode } from '../../../../../environments/actionCode';


enum PageTypeEnum {
  ManagePage,
  SelectPage,
  AddPage,
  EditPage,
  DetailPage,
  StockOutPage
}
interface ButtonState {
  edit: boolean;
  finish: boolean;
  del: boolean;
  print: boolean;
  stockOut: boolean;
  erp: boolean;
}
@Component({
  selector: 'app-purchase-out',
  templateUrl: './purchase-out.component.html',
  styleUrls: ['./purchase-out.component.scss']
})
export class PurchaseOutComponent implements OnInit {
  tabPageType = PageTypeEnum;
  ActionCode = ActionCode;
  currentPage: PageTypeEnum;
  tableConfig: UfastTableNs.TableConfig;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('orderTpl') orderTpl: TemplateRef<any>;
  /**
   * 列表数据
   */
  purchaseOutDataList: any;
  /**
   * 搜索
   */
  filters: any;
  /**
   * 高级搜索显隐
   */
  showAdvancedSearch: boolean;
  /**
   * 退货单状态
   */
  returnState: any[];
  /**
   * 是否条码管理
   */
  barcodeFlagList: any[];
  /**
   * 编辑，详情id
   */
  detailId: string;
  /**
   * 编辑页传参
   */
  stockRecordDataList: any[];
  /**
   * 是否是出库页
   */
  isStockOut: boolean;
  buttonState: { [index: string]: ButtonState };
  constructor(private messageService: ShowMessageService,
    private purchaseOutService: PurchaseOutService, private utilService: UfastUtilService,
    private printTplSelector: PrintTplSelectorService) {
    this.currentPage = this.tabPageType.ManagePage;
    this.purchaseOutDataList = [];
    this.filters = {};
    this.showAdvancedSearch = false;
    this.stockRecordDataList = [];
    this.isStockOut = false;
    this.buttonState = {};
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.endCreateDate) {
      return false;
    }
    return startDate.getTime() > this.filters.endCreateDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.startCreateDate) {
      return false;
    }
    return endDate.getTime() <= this.filters.startCreateDate.getTime();
  }
  getPurchaseOutDataList = () => {
    this.tableConfig.checkAll = false;
    this.purchaseOutDataList = [];
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.startCreateDate = this.filters.startCreateDate ?
      this.utilService.getStartDate(this.filters.startCreateDate) : undefined;
    this.filters.endCreateDate = this.filters.endCreateDate ?
      this.utilService.getEndDate(this.filters.endCreateDate) : undefined;
    const filter = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.buttonState = {};
    this.purchaseOutService.getPurchaseOutList(filter).subscribe((resData: any) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.purchaseOutDataList = resData.value.list;
      this.purchaseOutDataList.forEach((item) => {
        this.buttonState[item.id] = {
          edit: item.status === PurchaseOutServiceNs.StockOutStatus.Undone,
          finish: item.status !== PurchaseOutServiceNs.StockOutStatus.Undone &&
            item.status !== PurchaseOutServiceNs.StockOutStatus.All && item.status !== PurchaseOutServiceNs.StockOutStatus.Finish,
          del: item.status === PurchaseOutServiceNs.StockOutStatus.Undone,
          stockOut: (item.status === PurchaseOutServiceNs.StockOutStatus.Wait || item.status === PurchaseOutServiceNs.StockOutStatus.Part)
            && item.barcodeFlag !== PurchaseOutServiceNs.BarcodeFlag.Barcode,
          print: true,
          erp: (item.status === PurchaseOutServiceNs.StockOutStatus.All ||
            item.status === PurchaseOutServiceNs.StockOutStatus.Finish)
            && item.erpStatus !== PurchaseOutServiceNs.ErpStatus.InSync && item.erpStatus !== PurchaseOutServiceNs.ErpStatus.SyncDone

        };
      });
      this.tableConfig.total = resData.value.total;
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public reset() {
    this.filters = {};
    this.getPurchaseOutDataList();
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  /**
   * 选择
   */
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.purchaseOutDataList.length; i < len; i++) {
      this.purchaseOutDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.purchaseOutDataList.every((item, index, array) => {
        return item._checked === true;
      });
    }
  }
  public add() {
    this.currentPage = this.tabPageType.SelectPage;
  }
  public edit(id) {
    this.detailId = id;
    this.currentPage = this.tabPageType.EditPage;
  }
  public detail(id) {
    this.detailId = id;
    this.isStockOut = false;
    this.currentPage = this.tabPageType.DetailPage;
  }
  public stockOut(id) {
    this.detailId = id;
    this.isStockOut = true;
    this.currentPage = this.tabPageType.StockOutPage;
  }
  public del(id) {
    const arr = [];
    arr.push(id);
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.purchaseOutService.deletePurchaseOut(arr), true);
    });
  }
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: PurchaseOutServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getPurchaseOutDataList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public finish(id, refundCode, materialDetailId) {
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      const detailVOIdList = [];
      const data = {
        id: id,
        detailVOIdList: detailVOIdList
      };
      this.commonResDeal(this.purchaseOutService.statementFinish(data), true);
    });
  }
  public print(id, refundCode) {
    this.messageService.showLoading();
    this.purchaseOutService.getPurchaseOutDetail(id).subscribe((resData: PurchaseOutServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value['qrcode'] = resData.value.refundCode;
      this.printTplSelector.showTplSelector({
        printConfig: ReturnApply,
        headerInfo: resData.value,
        dataList: resData.value.detailVOList
      });
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public doErpSync(id: string) {
    this.messageService.showAlertMessage('', '确定执行到ERP同步', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.messageService.showLoading('');
        this.purchaseOutService.stockInErpSync(id).subscribe((resData: PurchaseOutServiceNs.UfastHttpResT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getPurchaseOutDataList();
        }, (error) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public childPageFinish() {
    this.currentPage = this.tabPageType.ManagePage;
    this.getPurchaseOutDataList();
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-purchaseOut',
      pageSize: 10,
      pageNum: 1,
      showCheckbox: true,
      checkRowField: '_checked',
      checkAll: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operationTpl, width: 180, fixed: true },
      { title: '退货单号', tdTemplate: this.orderTpl, width: 180, fixed: true },
      { title: '合同号', field: 'contractNo', width: 220 },
      { title: '出库状态', field: 'status', width: 100, pipe: 'returnState' },
      { title: '是否条码管理', field: 'barcodeFlag', width: 120, pipe: 'barcodeManage' },
      { title: 'ERP状态', field: 'erpStatus', width: 100, pipe: 'erpSync' },
      { title: '退货原因', field: 'reason', width: 100 },
      { title: '制单人', field: 'createName', width: 120 },
      { title: '制单时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' },
      ]
    };
    this.purchaseOutService.getBarcodeList().subscribe((barcodeList) => {
      this.barcodeFlagList = barcodeList;
    });
    this.purchaseOutService.getReturnStateList().subscribe((returnState) => {
      this.returnState = returnState;
    });
    this.getPurchaseOutDataList();
  }

}
