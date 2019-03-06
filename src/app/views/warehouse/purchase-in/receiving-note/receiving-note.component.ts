import {Component, OnInit, TemplateRef, ViewChild, Input, ChangeDetectorRef} from '@angular/core';
import { UfastTableNs } from '../../../../layout/layout.module';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { ReceivingNoteService, ReceivingNoteServiceNs } from '../../../../core/trans/receiving-note.service';
import { Observable } from 'rxjs/Observable';
import { ReceivingBill, warehouseWarrantNotice } from '../../../../../environments/printData';
import { PrintTplSelectorService } from '../../../../widget/print-tpl-selector/print-tpl-selector';
import { ActionCode } from '../../../../../environments/actionCode';
import { Router, ActivatedRoute } from '@angular/router';
import {environment} from '../../../../../environments/environment';

enum PageType {
  ManagePage = 0,
  AddPage = 1,
  EditPage = 2,
  DetailPage = 3,
  ConfirmPage = 4,
  AcceptancePage,        // 验收页
  returnAcceptancePage,    // 验收退回页
}
// 收货列表查询字段
interface FiltersType {
  supplierName?: string;
  contractType?: string;
  purchaseNo?: string;
  goodsReceivor?: string;
  deliveryStatus?: number;
}

interface ActionStatus {
  receive: boolean;
  manualFinish: boolean;
  print: boolean;
  acceptance: boolean;
  printBarcode: boolean;
  returnAcceptance: boolean;
}
@Component({
  selector: 'app-receiving-note',
  templateUrl: './receiving-note.component.html',
  styleUrls: ['./receiving-note.component.scss']
})
export class ReceivingNoteComponent implements OnInit {
  tableConfig: UfastTableNs.TableConfig;
  tabPageType = PageType;
  currentPageType: number;
  receivingNoteDataList: ReceivingNoteServiceNs.ReceivingNoteList[];
  filters: FiltersType;
  advancedSearchShow: boolean;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('invoiceNoTpl') invoiceNoTpl: TemplateRef<any>;
  @ViewChild('deliverTpl') deliverTpl: TemplateRef<any>;
  contractType: any; // 在服务里定义数据模型，得到合同类型
  invoiceNo: string; // 点击详情传发货单号
  editContractType: string;
  actionStatus: { [index: string]: ActionStatus };
  ActionCode = ActionCode;
  isAcceptance: boolean;
  searchInputLen = environment.otherData.searchInputMaxLen;
  constructor(private receivingNoteService: ReceivingNoteService, private cdRef: ChangeDetectorRef,
    private messageService: ShowMessageService, private printTplSelector: PrintTplSelectorService,
    private router: Router,
  ) {
    this.actionStatus = {};
    this.currentPageType = this.tabPageType.ManagePage;
    this.filters = {};
    this.receivingNoteDataList = [];
    this.advancedSearchShow = false;
    this.contractType = [
      { id: 1, type: '采购订单' },
      { id: 2, type: '年度协议' }
    ];
  }
  public trackById(item: any) {
    return item.id;
  }
  getReceivingNoteList = (pageNum?: number, pageSize?: number) => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.deliveryStatus = 10;
    const filter = {
      pageNum: this.tableConfig.pageNum || pageNum,
      pageSize: this.tableConfig.pageSize || pageSize,
      filters: this.filters
    };
    this.tableConfig.loading = true;
    this.receivingNoteService.getReceivingNoteList(filter).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.receivingNoteDataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.tableConfig.loading = false;
      this.tableConfig.checkAll = false;
      this.actionStatus = {};
      this.receivingNoteDataList.forEach((item, index) => {
        const unOrPartRec = (item.status === ReceivingNoteServiceNs.BillStatus.UnReceive
          || item.status === ReceivingNoteServiceNs.BillStatus.PartReceive)
           && (item.billType === ReceivingNoteServiceNs.BillType.Dispach)
           && (item.qrDeliveryStatus === ReceivingNoteServiceNs.QrDeliveryStatus.RegSend);
        item.isShowActionPopover = false;
        item.index = index;
        this.actionStatus[item.invoiceNo] = {
          print: true,
          receive: (item.status === ReceivingNoteServiceNs.BillStatus.PartReceive ||
            item.status === ReceivingNoteServiceNs.BillStatus.AllReceive ) && (item.stockStatus === ReceivingNoteServiceNs.BillStatus.Init
            || item.stockStatus === ReceivingNoteServiceNs.BillStatus.PartStockIn)
            && item.ifCodeManage === ReceivingNoteServiceNs.BarcodeFlag.Flase,
          manualFinish: item.status !== ReceivingNoteServiceNs.BillStatus.AllStockIn &&
            item.status !== ReceivingNoteServiceNs.BillStatus.Finish && item.stockStatus !== ReceivingNoteServiceNs.BillStatus.AllStockIn,
          acceptance: unOrPartRec,
          printBarcode: item.ifCodeManage === ReceivingNoteServiceNs.BarcodeFlag.True,
          returnAcceptance: (item.status === ReceivingNoteServiceNs.BillStatus.PartReceive ||
             item.status === ReceivingNoteServiceNs.BillStatus.AllReceive) &&
           item.stockStatus === ReceivingNoteServiceNs.BillStatus.Init
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getReceivingNoteList();
  }
  public toggleAdvancedSearch() {
    this.advancedSearchShow = !this.advancedSearchShow;
  }
  public onChildFinish() {
    this.currentPageType = this.tabPageType.ManagePage;
    this.getReceivingNoteList();
  }
  public detail(invoiceNo: string) {
    this.isAcceptance = false;
    this.currentPageType = this.tabPageType.DetailPage;
    this.invoiceNo = invoiceNo;
  }
  public acceptancePage(invoiceNo: string) {
    this.currentPageType = this.tabPageType.AcceptancePage;
    this.invoiceNo = invoiceNo;
    this.isAcceptance = true;
  }
  public add() {
    this.currentPageType = this.tabPageType.AddPage;
  }
  public confirm(invoiceNo, contractType) {
    if (!this.actionStatus[invoiceNo].receive) {
      return;
    }
    this.currentPageType = this.tabPageType.ConfirmPage;
    this.invoiceNo = invoiceNo;
    this.editContractType = contractType;
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.receivingNoteDataList.length; i < len; i++) {
      this.receivingNoteDataList[i][this.tableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.tableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.tableConfig.checkAll = this.receivingNoteDataList.every((item, index, array) => {
        return item._checked === true;
      });
    }
  }

  // 弹框提示
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getReceivingNoteList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public delete(invoiceNo: string) {
    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }

      this.commonResDeal(this.receivingNoteService.deleteReceivingNote(invoiceNo), true);
    });
  }
  public accountStatement(no: string) {
    if (!this.actionStatus[no].manualFinish) {
      return;
    }
    this.messageService.showAlertMessage('', '确定要结单吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      const data = {
        billNo: no
      };
      this.messageService.showLoading('');
      this.receivingNoteService.accountStatement(data).
        subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
          this.messageService.closeLoading();
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'warning');
            return;
          }
          this.messageService.showToastMessage('操作成功!', 'success');
          this.getReceivingNoteList();
        }, (error: any) => {
          this.messageService.closeLoading();
          this.messageService.showAlertMessage('', error.message, 'error');
        });
    });
  }
  public print(invoiceNo: string) {
    if (!this.actionStatus[invoiceNo].print) {
      return;
    }
    this.receivingNoteService.getReceivingNoteStockInDetail(invoiceNo).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      resData.value.invoiceInfo['qrcode'] = resData.value.invoiceInfo.invoiceNo;
      this.printTplSelector.showTplSelector({
        printConfig: ReceivingBill,
        headerInfo: resData.value.invoiceInfo,
        dataList: resData.value.detailList
      });
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public printBarcode(invoiceNo, index) {
    this.receivingNoteDataList[index].isShowActionPopover = false;
    this.cdRef.detectChanges();
    this.router.navigate(['/main/warehouse/barCodeManage/packageCode'], {queryParams: {order: invoiceNo}});
  }
  public printWarehouseWarrant(invoiceNo) {
    this.messageService.showLoading();
    this.receivingNoteService.getPrintWarehouseWarrantData(invoiceNo).subscribe((resData: ReceivingNoteServiceNs.UfastHttpResT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      const warehouseWarrantDataList = [];
      resData.value.forEach((item) => {
        const temp = <any>{};
        temp.headerInfo = item.invoiceInfo;
        temp.headerInfo.qrcode = item.invoiceInfo.invoiceNo;
        temp.headerInfo.keeperName = item.keeperName;
        temp.dataList = item.detailList;
        warehouseWarrantDataList.push(temp);
      });
      this.printTplSelector.showTplSelector({
        printConfig: warehouseWarrantNotice,
        orderDataList: warehouseWarrantDataList
      });

    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public returnAcceptance(invoiceNo: string) {
    this.currentPageType = this.tabPageType.returnAcceptancePage;
    this.invoiceNo = invoiceNo;
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'warehouse-receivingNote',
      pageSize: 10,
      showCheckbox: true,
      checkAll: false,
      checkRowField: '_checked',
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{ title: '操作', tdTemplate: this.operationTpl, width: 180, fixed: true },
      { title: '收货单号', tdTemplate: this.invoiceNoTpl, width: 180, fixed: true },
      { title: '单据类型', field: 'billType', width: 100, pipe: 'billType' },
      { title: '验收状态', field: 'status', width: 100, pipe: 'documentState' },
      { title: '入库状态', field: 'stockStatus', width: 100, pipe: 'receiveStockStatus' },
      { title: '发货类型', field: 'deliveryType', width: 150, pipe: 'deliverGoodsType' },
      { title: '是否条码管理', field: 'ifCodeManage', width: 130, pipe: 'barcodeManage' },
      { title: '供应商', field: 'supplierName', width: 200 },
      { title: '合同号', field: 'purchaseNo', width: 180 },
      { title: '合同类型', field: 'contractType', width: 150, pipe: 'contractType' },
      { title: '业务实体', field: 'businessEntity', width: 100, },
      { title: '收货方', field: 'goodsReceivor', width: 100 },
      { title: '收单方', field: 'billReceivor', width: 100 },
      { title: '制单时间', field: 'createDate', width: 180, pipe: 'date:yyyy-MM-dd HH:mm' },
      { title: '制单人', field: 'creatorName', width: 200 }
      ]
    };
    this.getReceivingNoteList();
  }

}
