import { LodopPrintService } from './../../../../core/infra/lodop-print.service';
import { DispatchBillTplComponent, DispatchBillTplData
} from './../../../../layout/print-template/dispatch-bill-tpl/dispatch-bill-tpl.component';
import {Component, OnInit, TemplateRef, ViewChild, Input, ChangeDetectorRef} from '@angular/core';
import { UfastTableNs } from '../../../../layout/layout.module';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { DispatchBillService, DispatchBillServiceNs } from '../../../../core/trans/dispatch-bill.service';
import { Observable } from 'rxjs/Observable';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { PrintTplSelectorNs, PrintTplSelectorService} from '../../../../widget/print-tpl-selector/print-tpl-selector';
import {DispatchBill} from '../../../../../environments/printData';
import {ActionCode} from '../../../../../environments/actionCode';
import {Router} from '@angular/router';
import {environment} from '../../../../../environments/environment';

interface TabPageType {
  ManagePage: number;
  AddPage: number;
  EditPage: number;
  DetailPage: number;
  DeliveryPage: number;
  BatchDeliveryPage: number;
}
// 发货列表查询字段
interface FiltersType {
  invoiceNo: string;
  purchaseNo: string;
  goodsReceivor: string;
  deliveryStatus: string;
  startDate: any;
  endDate: any;
}
// 合同列表查询字段
interface ContractFiltersType {
  contractType: string;
  purchaseNo: string;
  goodsReceivor: string;
  startDate: string;
  endDate: string;
}
enum DeliverGoodsStatus {
  Undone,
  Part,
  Done,
  Finish
}
interface ActionStatus {
  edit: boolean;
  del: boolean;
  delivery: boolean;
  print: boolean;
  printBarcode: boolean;
}

@Component({
  selector: 'app-dispatch-bill',
  templateUrl: './dispatch-bill.component.html',
  styleUrls: ['./dispatch-bill.component.scss']
})
export class DispatchBillComponent implements OnInit {
  OrderStatusEnum = DispatchBillServiceNs.SubmitType;
  tableConfig: UfastTableNs.TableConfig;
  tabPageType: TabPageType;
  currentPageType: number;
  dispathcBillDataList: DispatchBillServiceNs.DispatchBillList[];
  deliveryStatusList: {id: number, name: string}[]; // 在服务里定义数据模型，得到发货状态
  filters: FiltersType;
  advancedSearchShow: boolean;
  contractTableConfig: UfastTableNs.TableConfig;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('invoiceNoTpl') invoiceNoTpl: TemplateRef<any>;
  @ViewChild('deliverTpl') deliverTpl: TemplateRef<any>;
  editPage: string; // 点击编辑的时候里面的值，合同类型字段
  contractType: any; // 在服务里定义数据模型，得到合同类型
  contractFilters: ContractFiltersType; // 就在Ts里定义，合同列表查询
  addPage: string;
  invoiceNo: string; // 点击详情传发货单号
  editContractType: string;
  selectedList: any[];
  selectedListIds: number[];

  batchDeliveryOrderList: DispatchBillServiceNs.DispatchBillList[];
  deliverGoodsStatus = DeliverGoodsStatus;
  actionStatus: {[index: string]: ActionStatus};
  ActionCode = ActionCode;
  searchInputLen = environment.otherData.searchInputMaxLen;
  dispatchBillPrintData: DispatchBillTplData[];
  constructor(private dispatchBillService: DispatchBillService, private cdRef: ChangeDetectorRef,
    private messageService: ShowMessageService, private printSelector: PrintTplSelectorService,
    private ufastUtilService: UfastUtilService, private router: Router,
    private lodopService: LodopPrintService) {
    this.batchDeliveryOrderList = [];
    this.actionStatus = {};
    this.tabPageType = {
      ManagePage: 0,
      AddPage: 1,
      EditPage: 2,
      DetailPage: 3,
      DeliveryPage: 4,
      BatchDeliveryPage: 5
    };
    this.currentPageType = this.tabPageType.ManagePage;
    this.dispathcBillDataList = [];
    this.filters = <any>{};
    this.deliveryStatusList = [
      {id: 0, name: '待提交'},
      {id: 1, name: '待发货'},
      {id: 10, name: '已发货'},
    ];
    this.advancedSearchShow = false;
    this.contractType = [];
    this.contractFilters = <any>{};
    this.selectedList = [];
    this.selectedListIds = [];
    this.dispatchBillPrintData = [];
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
  getDispatchBillList = (pageNum?: number) => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    if (this.filters.endDate) {
      this.filters.endDate = this.ufastUtilService.getEndDate(this.filters.endDate);
    }
    if (this.filters.startDate) {
      this.filters.startDate = this.ufastUtilService.getStartDate(this.filters.startDate);
    }
    this.filters['billType'] = 0;
    const filter = {
      pageNum: this.tableConfig.pageNum || pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.tableConfig.checkAll = false;
    this.dispatchBillService.getDispatchBillList(filter).subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.dispathcBillDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.actionStatus = {};
      this.dispathcBillDataList.forEach((item, index) => {
        item.isShowActionPopover = false;
        item.index = index;
        const isCodeManage: boolean = item.ifCodeManage === DispatchBillServiceNs.BarcodeFlag.True;
        this.actionStatus[item.invoiceNo] = {
          edit: item.deliveryStatus === DispatchBillServiceNs.DeliveryStatus.WAIT_SUBMIT,
          print: item.deliveryStatus !== DispatchBillServiceNs.DeliveryStatus.WAIT_SUBMIT,
          del: item.deliveryStatus === DispatchBillServiceNs.DeliveryStatus.WAIT_SUBMIT,
          delivery: isCodeManage ? item.deliveryStatus ===
            DispatchBillServiceNs.DeliveryStatus.QR_ALL_SEND : item.deliveryStatus === DispatchBillServiceNs.DeliveryStatus.WAIT_SEND,
          printBarcode: isCodeManage
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public searchTextChange(searchText) {
    this.filters.invoiceNo = searchText;
  }
  public refresh() {
    this.advancedSearchShow = false;
    this.advancedSearch();
  }
  public advancedSearch() {
    this.getDispatchBillList();
  }
  public advancedSearchReset() {
    Object.keys(this.filters).forEach((item: string) => {
      this.filters[item] = '';
    });
    this.getDispatchBillList();
  }
  public toggleAdvancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public onChildFinish() {
    this.currentPageType = this.tabPageType.ManagePage;
    this.getDispatchBillList();
  }
  public detail(invoiceNo) {
    this.currentPageType = this.tabPageType.DetailPage;
    this.invoiceNo = invoiceNo;
  }
  public add() {
    this.currentPageType = this.tabPageType.AddPage;
  }
  public edit(invoiceNo, contractType) {
    if (!this.actionStatus[invoiceNo].edit) {
      return;
    }
    this.currentPageType = this.tabPageType.EditPage;
    this.invoiceNo = invoiceNo;
    this.editContractType = contractType;
  }

  public changeSelect(event: UfastTableNs.SelectedChange) {
    const checked = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
    if (event.index === -1) {
      this.tableConfig.checkAll = checked;
      this.dispathcBillDataList.forEach((item: any) => {
        item[this.tableConfig.checkRowField] = checked;
      });
      return;
    }
    this.tableConfig.checkAll = checked;
    if (checked) {
      for (let i = 0, len = this.dispathcBillDataList.length; i < len; i++) {
        if (!this.dispathcBillDataList[i][this.tableConfig.checkRowField]) {
          this.tableConfig.checkAll = false;
          break;
        }
      }
    }
  }

  // 弹框提示
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getDispatchBillList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public delete(invoiceNo: string) {
    if (!this.actionStatus[invoiceNo].del) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.dispatchBillService.deleteDispatchBill(invoiceNo), true);
    });
  }
  public printOrder(invoiceNo: string) {
    if (!this.actionStatus[invoiceNo].print) {
      return;
    }
    this.messageService.showLoading('');
    this.dispatchBillService.getDispatchBillDetail(invoiceNo).subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.invoiceInfo['qrcode'] = resData.value.invoiceInfo.invoiceNo;
      this.printSelector.showTplSelector({
        printConfig: DispatchBill,
        headerInfo: resData.value.invoiceInfo,
        dataList: resData.value.detailList
      });
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showToastMessage(error.message, 'error');
    });
  }
  public printBarcode(invoiceNo, index) {
    this.router.navigate(['/main/warehouse/barCodeManage/packageCode'], {queryParams: {order: invoiceNo}})
      .then(() => {
        this.dispathcBillDataList[index].isShowActionPopover = false;
        this.cdRef.detectChanges();
      });
  }
  public printBarcodeOrder(invoiceNo: string) {
    this.messageService.showLoading('');
    this.dispatchBillService.getDispatchBillDetail(invoiceNo).subscribe((resData: DispatchBillServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.dispatchBillPrintData = [];
      this.dispatchBillPrintData.push(resData.value.invoiceInfo);
      this.lodopService.print(DispatchBillTplComponent, this.dispatchBillPrintData, 'data');
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showToastMessage(error.message, 'error');
    });
  }
  public delivery(invoiceNo: string) {
    if (!this.actionStatus[invoiceNo].delivery) {
      return;
    }
    this.currentPageType = this.tabPageType.DeliveryPage;
    this.invoiceNo = invoiceNo;
  }
  public batchDelivery() {
    this.batchDeliveryOrderList = [];
    for (let i = 0, len = this.dispathcBillDataList.length; i < len; i++) {
      if (this.dispathcBillDataList[i][this.tableConfig.checkRowField]) {
        if (!this.actionStatus[this.dispathcBillDataList[i].invoiceNo].delivery) {
          this.messageService.showToastMessage('所选订单中包含不可发货的订单', 'warning');
          return;
        }
        if (this.dispathcBillDataList[i].deliveryStatus === DeliverGoodsStatus.Done
          || this.dispathcBillDataList[i].deliveryStatus === DeliverGoodsStatus.Finish) {
          this.messageService.showToastMessage('已发货和已结单的订单无法发货', 'warning');
          return;
        }
        this.batchDeliveryOrderList.push(this.dispathcBillDataList[i]);
      }
    }
    if (this.batchDeliveryOrderList.length === 0) {
      this.messageService.showToastMessage('请选择需要发货的订单', 'warning');
      return;
    }
    this.currentPageType = this.tabPageType.BatchDeliveryPage;
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-dispatchBill',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operationTpl, width: 180, fixed: true },
      { title: '发货类型', field: 'deliveryType', width: 130, pipe: 'deliverGoodsType' },
      { title: '发货单号', tdTemplate: this.invoiceNoTpl, width: 200 },
      { title: '发货状态', field: 'deliveryStatus', width: 140, pipe: 'deliverGoodsStatus' },
      { title: '是否条码管理', field: 'ifCodeManage', width: 130, pipe: 'barcodeManage' },
      { title: '采购合同号', field: 'purchaseNo', width: 150 },
      { title: '合同类型', field: 'contractType', width: 100, pipe: 'contractType' },
      { title: '业务实体', field: 'businessEntity', width: 180 },
      { title: '收货方', field: 'goodsReceivor', width: 180 },
      { title: '收单方', field: 'billReceivor', width: 180 },
      { title: '制单时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm' },
      { title: '制单人', field: 'creatorName', width: 120 }
      ]
    };
    this.contractTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      headers: [
        { title: '行号', field: '', width: 100 },
        { title: '操作', tdTemplate: this.deliverTpl, width: 100 },
        { title: '合同编号', field: '', width: 200 },
        { title: '发货状态', field: '', width: 100, pipe: 'deliverGoodsStatus' },
        { title: '合同类型', field: '', width: 100, pipe: 'contractType' },
        { title: '签约日期', field: '', width: 100, pipe: 'date:yyyy-MM-dd HH:mm' },
        { title: '交货日期', field: '', width: 100 },
        { title: '业务实体', field: '', width: 80 },
        { title: '收货方', field: '', width: 100 },
        { title: '收单方', field: '', width: 100 }
      ]
    };
    this.getDispatchBillList();
  }

}
