import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {NewsServiceNs} from '../../../core/common-services/news.service';
import {Observable} from 'rxjs/Observable';
import {InvoiceService, InvoiceServiceNs} from '../../../core/trans/invoice.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PrintService} from '../../../core/trans/print.service';
import {LodopPrintService, LodopPrintServiceNs} from '../../../core/infra/lodop-print.service';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
import {PrintErrorService} from '../../../widget/print-error/print-error';
import {
  InvoiceContactTplComponent, InvoiceContactOrder
} from '../../../layout/print-template/invoice-contact-tpl/invoice-contact-tpl.component';
import {localDataKeyObj} from '../../../../environments/environment';
import {ActionCode} from '../../../../environments/actionCode';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';

import { environment } from '../../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {WorkBoardService, WorkBoardServiceNs} from '../../../core/trans/work-board.service';

enum TabPageType {
  ManagePage = 0,
  AddPage,
  EditPage,
  MatchPage,
  DetailPage,
}
const MaxInputNumber = 99999999999999999999;
enum MaxInputLen {
  Default = 50
}
interface TotoalAmountOfItem {
  totalQuantity: number;
  totalRowAmount: number;
  totalTaxCodeAmount: number;
}
// 定义高级搜索所用到的字段
interface FilterItem {
  id ?: string;
  purchaseNo ?: string;
  invoiceBillId ?: string;
  supplierName?: string;
  businessEntity?: string;
  state?: string;
  creator?: string;
  startDate?: any;
  endDate?: any;
  erpId?: string;
}
interface ActionStatus {
  edit: boolean;
  del: boolean;
  print: boolean;
}
@Component({
  selector: 'app-invoice-contact',
  templateUrl: './invoice-contact.component.html',
  styleUrls: ['./invoice-contact.component.scss']
})
export class InvoiceContactComponent implements OnInit {
  @ViewChild('operationTpl')operationTpl: TemplateRef<any>;
  @ViewChild('payedAmountTpl')payedAmountTpl: TemplateRef<any>;
  @ViewChild('idTpl') idTpl: TemplateRef<any>;
  ActionCode = ActionCode;
  tabPageType: TabPageType;
  addOrEditPage: string;
  fullSearchShow: boolean;
  filters: FilterItem;

  operateInvoiceId: string;
  inoviceForm: FormGroup;
  countForm: FormGroup;
  dateFormat = 'yyyy-MM-dd';
  matchSupplierId: string;
  detailInvoice: any;
  isVisible = false;

  invoiceDataList: any[];
  invoiceDataChildList: any[];
  invoiceMatchDataList: any[];
  payQueryDataList: any[];
  taxCodeDateList: any[];
  invoiceStateList: any[];
  invoiceTableConfig: UfastTableNs.TableConfig;
  invoiceChildTableConfig: any;
  invoiceDetailTableConfig: UfastTableNs.TableConfig;
  invoiceMatchTableConfig: UfastTableNs.TableConfig;
  payQueryTableConfig: any;

  // 定义行金额实时计算所用到的变量
  quantityRealCalculation: number = null;
  billWithoutaxPriceRealCalculation: number = null;
  rowAmountRealCalculation: number = null;
  taxCodeRealCalculation: number = null;
  taxCodeIdCalculation: number = null;
  taxAmountRealCalculation: number = null;
  // 合计实时计算变量
  invoiceNumCountCalculation: number = null;
  lineAmountCountCalculation: number = null;
  taxCountCalculation: number = null;
  totalMoneyCountCalculation: number = null;
  // 用于匹配交货查询原有的子数组的长度，确保只会从后续新添加的数组进行遍历填充
  invoiceChildDataListPreLength: number = null;

  // 打印所用到的相关变量
  invoiceId: string;
  printIsVisible: boolean;
  printTpl: any;
  printShow: boolean;
  templateName: string;
  templateData: any;
  printData: InvoiceContactOrder;
  printDirList: {label: string; value: LodopPrintServiceNs.PageSizeDir}[];
  printDir: LodopPrintServiceNs.PageSizeDir;
  matchItemList: string[];
  matchFilters: any;
  receiveDateRange: string[];
  maxInputNumber = MaxInputNumber;
  MaxInputLenEnum = MaxInputLen;
  detailFieldList: { name: string; field: string; pipe?: string } [];
  showMatchSearch: boolean;
  moneyDec: number;
  moneyMin: number;
  moneyMax: number;
  invoiceNumDec: number;
  invoiceNumMin: number;
  invoiceNumMax: number;
  auditFlowData: WorkBoardServiceNs.AuditFlowData;
  showAuditFlowBtu: boolean;
  auditSubmitData: WorkBoardServiceNs.AuditData;
  auditModalShow: boolean;
  actionStatus: {[index: string]: ActionStatus};
  showAuditHistory: boolean;
  approveInfo: WorkBoardServiceNs.ApproveInfo;
  isAuditReject: boolean;
  constructor(private messageService: ShowMessageService,
              private invoiceService: InvoiceService,
              private formBuilder: FormBuilder,
              private printService: PrintService,
              private lodopService: LodopPrintService,
              private ufastUtilService: UfastUtilService,
              private printErrorService: PrintErrorService,
              private activatedRouter: ActivatedRoute,
              private router: Router, private workBoardService: WorkBoardService
              ) {
    this.showAuditHistory = false;
    this.actionStatus = {};
    this.auditSubmitData = <any>{};
    this.auditModalShow = false;
    this.showAuditFlowBtu = false;
    this.auditFlowData = <any>{};
    this.showMatchSearch = false;
    this.receiveDateRange = null;
    this.matchFilters = {};
    /**匹配交货合并开票的匹配条件**/
    this.matchItemList = [
      'taxRateId',          // 税码
      'currencyType',     // 币种
      'purchaseType',     // 采购类型
      'businessEntity',   // 业务实体
      'settlementMethod', // 合同结算方式
      'processor',        // 采购业务员(员工代码)
      'goodsReceivor',    // 收货方
      'billReceivor',      // 收单方
      'supplierNo'        // 供应商编码
    ];
    /**
     * 详情页
     * */
    this.detailFieldList = [
      { name: '供应商', field: 'supplierName'},
      { name: '发票编号', field: 'invoiceBillId'},
      { name: '发票张数', field: 'billNum'},
      { name: '发票金额', field: 'billAmount'},
      { name: '发票行金额合计', field: 'rowAmount'},
      { name: '发票税额合计', field: 'taxAmount'},
      { name: '收款单位账号', field: 'billAccountNo'},
      { name: '收款单位开户行', field: 'billBank'},
      { name: '开户行地址', field: 'billBankAddress'},
      { name: '运杂费', field: 'transportFees'},
      { name: '减：预付款', field: 'prepayments'},
      { name: '暂扣：质保金', field: 'warranty'},
      { name: '减：扣款项', field: 'deduction'},
      { name: '发票日期', field: 'billCreateDate', pipe: 'date:yyyy-MM-dd'},
      // { name: '待审批人', field: 'approver'},
      { name: '发票联系单号', field: 'code'},
      { name: '描述', field: 'description'},
    ];
    this.printDirList = [{
      label: '默认',
      value: LodopPrintServiceNs.PageSizeDir.Default
    }, {
      label: '纵向',
      value: LodopPrintServiceNs.PageSizeDir.Portrait
    }, {
      label: '横向',
      value: LodopPrintServiceNs.PageSizeDir.Landscape
    }];
    this.printDir = this.ufastUtilService.getLocalData(localDataKeyObj.invoiceContactPrintDir) || LodopPrintServiceNs.PageSizeDir.Default;
    this.addOrEditPage = '';
    this.fullSearchShow = false;
    this.filters = {};
    // 定义高级搜索栏中状态数据
    this.invoiceStateList = [
      'APPROVED',
      'APPROVEDPR',
      'CANCEL',
      'CREATED',
      'NEW',
      'PROCESSING',
      'RECREATE',
      'REJECT',
      'SUBMIT',
      'PAID',
      'PREPAY',
      'APPROVING',
      'REFUSED',
      'COMPLETE'
    ];

    this.matchSupplierId = '';
    this.tabPageType = TabPageType.ManagePage;
    this.invoiceDataList = [];
    this.invoiceDataChildList = [];
    this.invoiceMatchDataList = [];
    this.payQueryDataList = [];
    this.taxCodeDateList = [];
    this.detailInvoice = '';

    this.invoiceChildTableConfig = {
      loading: false,
      pageSize: 10,
      pageNum: 1,
      pageSizeOptions: [10, 20, 30, 40, 50],
      header: [
        {name: '行号', field: 'rowNo', width: '50px'},
        {name: '类型', field: 'purchaseType', width: '80px'},
        {name: '采购订单号', field: 'purchaseNo', width: '160px'},
        {name: '物料编码', field: 'materialsNo', width: '140px'},
        {name: '物料描述', field: 'materialsName', width: '240px'},
        {name: '单位', field: 'unit', width: '70px'},
        {name: '入库数量', field: 'quantity', width: '100px'},
        {name: '本次开票数量', field: 'toMatchQuantity', width: '140px'},
        {name: '开票不含税单价', field: 'billWithoutaxPrice', width: '180px'},
        {name: '行金额', field: 'rowAmount', width: '170px'},
        {name: '税码', field: 'taxCode', width: '220px'},
        {name: '税额', field: 'taxAmount', width: '140px'},
        {name: '币种', field: 'currencyType', width: '60px'},
        {name: '实际开票含税单价', field: 'unitPriceWithtax', width: '150px'},
        {name: '总金额', field: 'totalAmount', width: '110px'},
        {name: '采购订单单价', field: 'unitPriceWithouttax', width: '140px'},
        {name: '采购业务员', field: 'processorName', width: '100px'}
      ]
    };
    // 查看详情时对应的表格
    this.invoiceDetailTableConfig = {
      loading: false,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      frontPagination: true,
      total: 0,
      pageSize: 10,
      pageNum: 1,
      headers: [
        {title: '行号', field: 'rowNo', width: 50, fixed: true},
        {title: '类型', field: 'purchaseType', width: 80},
        {title: '采购订单号', field: 'purchaseNo', width: 170},
        {title: '物料编码', field: 'materialsNo', width: 140},
        {title: '物料描述', field: 'materialsName', width: 240},
        {title: '单位', field: 'unit', width: 70},
        {title: '入库数量', field: 'quantity', width: 100},
        {title: '本次开票数量', field: 'toMatchQuantity', width: 130},
        {title: '开票不含税单价', field: 'billWithoutaxPrice', width: 160},
        {title: '行金额', field: 'rowAmount', width: 130},
        {title: '税码', field: 'taxCode', width: 170},
        {title: '税额', field: 'taxAmount', width: 120},
        {title: '币种', field: 'currencyType', width: 60},
        {title: '实际开票含税单价', field: 'unitPriceWithtax', width: 160},
        {title: '总金额', field: 'totalAmount', width: 140},
        {title: '采购订单单价', field: 'unitPriceWithouttax', width: 130},
        {title: '采购业务员', field: 'processorName', width: 110}
      ]
    };
    this.payQueryTableConfig = {
      header: [
        {name: '发票号', field: 'invoiceNo', width: '120px'},
        {name: '付款金额', field: 'payedAmount', width: '100px'},
        {name: '付款方式', field: 'payMethod', width: '80px'},
        {name: '付款凭证号', field: 'payVoucherNo', width: '100px'},
        {name: '付款时间', field: 'payVoucherTime', width: '170px'}
      ]
    };

    // 打印相关的变量赋值初始化
    this.invoiceId = '';
    this.printIsVisible = false;
    this.printTpl = [];
    this.printShow = false;
    this.templateName = '';
    this.templateData = '';
    this.moneyDec = environment.otherData.moneyDec;
    this.moneyMin = 0;
    this.moneyMax = environment.otherData.moneyMax;
    this.invoiceNumDec = environment.otherData.materialNumDec;
    this.invoiceNumMin = environment.otherData.materialNumMin;
    this.invoiceNumMax = environment.otherData.materialNumMax;
    this.isAuditReject = false;
  }
  public matchAdvancedSearch() {
    this.showMatchSearch = !this.showMatchSearch;
  }
  private isMatchedOrder(source: any, target: any): boolean {
    for (let i = 0, len = this.matchItemList.length; i < len; i++) {
      if (source[this.matchItemList[i]] !== target[this.matchItemList[i]]) {
        return false;
      }
    }
    return true;
  }
  public trackByTableHeader(index: number, item: any) {
    return item.field;
  }

  public trackByInvoiceId(index: number, item: any) {
    return item.id;
  }
  commonCount(totalObj?: TotoalAmountOfItem) {
    let totalQuantity = 0;
    let totalRowAmount = 0;
    let totalTaxCodeAmount = 0; // 税额合计
    let totalTaxAmount = 0; // 总金额合计
    if (totalObj) {
      totalQuantity = totalObj.totalQuantity;
      totalRowAmount = totalObj.totalRowAmount;
      totalTaxCodeAmount = totalObj.totalTaxCodeAmount;
    } else {
      this.invoiceDataChildList.forEach((itemData: any, index: number) => {
        totalQuantity = this.ufastUtilService.add(totalQuantity, itemData.quantityRealCalculation);
        totalRowAmount = this.ufastUtilService.add(totalRowAmount, itemData.rowAmountRealCalculation);
        totalTaxCodeAmount = this.ufastUtilService.add(totalTaxCodeAmount, itemData.taxAmountRealCalculation);
      });
    }
    totalRowAmount = parseFloat(totalRowAmount.toFixed(2));
    totalTaxCodeAmount = parseFloat(totalTaxCodeAmount.toFixed(2));
    totalTaxAmount = this.ufastUtilService.add(totalRowAmount, totalTaxCodeAmount);
    this.countForm.patchValue({
      'invoiceNumCount': totalQuantity,
      'lineAmountCount': totalRowAmount,
      'taxCount': totalTaxCodeAmount,
      'totalMoneyCount': totalTaxAmount,
    });
  }
  private fixedDec(data: number, num: number): number {
    return parseFloat(data.toFixed(num));
  }
  // 计算实际开票含税单价、行金额、税额、总金额
  private calcRowDataMoney(data) {
    let taxRate = 0;
    if (this.taxCodeDateList[data.taxCodeRealCalculation]) {
      taxRate = this.ufastUtilService.div(this.taxCodeDateList[data.taxCodeRealCalculation].taxRate, 100);
    }
    // 实际开票含税单价 = 开票不含税单价*(1+税码)
    data.unitPriceWithtax = this.fixedDec(this.ufastUtilService.mul(this.ufastUtilService.add(taxRate, 1),
      data.billWithoutaxPriceRealCalculation), 2);
    // 行金额=本次开票数量*开票不含税单价
    data.rowAmountRealCalculation = this.fixedDec(this.ufastUtilService.mul(data.quantityRealCalculation ,
      data.billWithoutaxPriceRealCalculation), 2);
    // 税额=行金额*税率
    data.taxAmountRealCalculation = this.fixedDec(this.ufastUtilService.mul(data.rowAmountRealCalculation , taxRate), 2);
    // 总金额 = 行金额+税额
    data.totalAmount = this.fixedDec(this.ufastUtilService.add(data.rowAmountRealCalculation, data.taxAmountRealCalculation), 2);
    this.verifyTotalAmount(data);
  }
  /**
   * 计算总金额是否等于开票含税单价 * 数量
   * */
  private verifyTotalAmount(rowData: any) {
    const tempTotal = this.fixedDec(this.ufastUtilService.mul(rowData.unitPriceWithtax, rowData.quantityRealCalculation), 2);
    rowData.totalAmountInvalid = !(tempTotal === rowData.totalAmount);
  }
  // 定义行金额实时计算触发数值改变的方法
  getQuantityChange(item: any, event: number) {
    this.calcRowDataMoney(item);
    this.commonCount();
  }
  // 开票不含税单价修改
  getbillChange(item: any, event: number) {

    item.billWithoutaxPriceRealCalculation = event;
    this.calcRowDataMoney(item);
    this.commonCount();
  }
  // 行金额修改
  getRowChange(item: any, event: number) {
    item.billWithoutaxPriceRealCalculation = this.ufastUtilService.div(event, item.quantityRealCalculation);
    this.calcRowDataMoney(item);
    this.commonCount();
  }
  /**
   * 批量赋税
   * */
  public batchTaxChange(event) {
    if (!event) {
      return;
    }
    const totalObj: TotoalAmountOfItem = {
      totalQuantity: 0,
      totalRowAmount: 0,
      totalTaxCodeAmount: 0
    };
    this.invoiceDataChildList.forEach((item) => {
      item.taxCodeRealCalculation = event;
      this.calcRowDataMoney(item);
      totalObj.totalQuantity = this.ufastUtilService.add(totalObj.totalQuantity, item.quantityRealCalculation);
      totalObj.totalRowAmount = this.ufastUtilService.add(totalObj.totalRowAmount, item.rowAmountRealCalculation);
      totalObj.totalTaxCodeAmount = this.ufastUtilService.add(totalObj.totalTaxCodeAmount, item.taxAmountRealCalculation);
    });
    this.commonCount(totalObj);
  }
  // 税码改变
  getTaxCodeChange(item: any, event: number) {
    item.taxCodeRealCalculation = event;
    this.calcRowDataMoney(item);
    this.commonCount();
  }
  // 税额改变
  getTaxAmountChange(item: any, event: number) {
    item.taxAmountRealCalculation = this.fixedDec(event, 2);
    item.totalAmount = this.fixedDec(this.ufastUtilService.add(item.rowAmountRealCalculation, item.taxAmountRealCalculation), 2);
    this.verifyTotalAmount(item);
    this.commonCount();
  }

  // 匹配确认后取消返回到新增发票联系单界面
  public backInvoiceAddPage() {
    this.tabPageType = TabPageType.AddPage;
  }

  // 匹配确认后取消返回到编辑发票联系单界面
  public backInvoiceEditPage() {
    this.tabPageType = TabPageType.EditPage;
  }
  public checkMatchTableRow(event: UfastTableNs.SelectedChange) {

    const checked = event.type === UfastTableNs.SelectedChangeType.Checked ? true : false;
    if (event.index === -1) {
      this.invoiceMatchTableConfig.checkAll = checked;
      this.invoiceMatchDataList.forEach((item: any) => {
        item[this.invoiceMatchTableConfig.checkRowField] = checked;
      });
      return;
    }
    this.invoiceMatchTableConfig.checkAll = checked;
    if (checked) {
      for (let i = 0, len = this.invoiceMatchDataList.length; i < len; i++) {
        if (!this.invoiceMatchDataList[i][this.invoiceMatchTableConfig.checkRowField]) {
          this.invoiceMatchTableConfig.checkAll = false;
          break;
        }
      }
    }
  }
  // 显示付款查询模态框
  showModal(item?: InvoiceServiceNs.EditInvoiceChildModel): void {
    this.isVisible = true;
    this.payQueryDataList = [];
    this.invoiceService.getPayQuery(item.erpId).subscribe((resData: InvoiceServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
      this.payQueryDataList = resData.value;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  // 弹框提示
  private commonResDeal(observer: Observable<any>, refresh: boolean = false) {
    observer.subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      if (resData.code === 0) {
        this.messageService.showToastMessage('操作成功', 'success');
        if (refresh) {
          this.getInvoiceList();
        }
      } else {
        this.messageService.showToastMessage(resData.message, 'warning');
      }
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 返回上一级
  public toggleManagePage() {
    this.inoviceForm.reset();
    this.tabPageType = TabPageType.ManagePage;
    this.getInvoiceList();
  }
  public detailReturn() {
    this.tabPageType = TabPageType.ManagePage;
    this.showAuditFlowBtu = false;
    if (this.auditFlowData.isAuditFlow === WorkBoardServiceNs.AuditFlowRouteParam.IsAuditFlow) {
      this.router.navigate([], {relativeTo: this.activatedRouter}).then(() => {
        // this.tabPageType = TabPageType.ManagePage;
        this.router.navigateByUrl('/main/workBoard');
      });
      this.getInvoiceList();
    }
    this.auditFlowData = <any>{};

  }
  // 展示发票联系单列表
  public getInvoiceList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    if (this.filters.endDate) {
      this.filters.endDate = this.ufastUtilService.getEndDate(this.filters.endDate).toUTCString();
    }
    if (this.filters.startDate) {
      this.filters.startDate = this.ufastUtilService.getStartDate(this.filters.startDate).toUTCString();
    }
    const filter = {
      pageNum: this.invoiceTableConfig.pageNum,
      pageSize: this.invoiceTableConfig.pageSize,
      filters: this.filters
    };
    this.invoiceTableConfig.loading = true;
    this.invoiceService.getInvoiceList(filter).subscribe((resData: InvoiceServiceNs.UfastHttpResT<any>) => {
      this.invoiceTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      if (!(resData.value instanceof Object)) {
        return;
      }
      this.actionStatus = {};
      this.invoiceDataList = resData.value.list.map((item, index) => {
        this.actionStatus[item.id] = {
          edit: item.state === InvoiceServiceNs.InvoiveSatus.NEW ||
            item.state === InvoiceServiceNs.InvoiveSatus.REJECT ||
            item.state === InvoiceServiceNs.InvoiveSatus.CANCEL ||
            item.state === InvoiceServiceNs.InvoiveSatus.REFUSED ||
            item.state === InvoiceServiceNs.InvoiveSatus.COMPLETE,
          del: item.state === InvoiceServiceNs.InvoiveSatus.NEW,
          print: true
        };
        if (typeof item.billAmount === 'number' ) {
          item.billAmount = item.billAmount.toFixed(2);
        }
        if (typeof  item.unpayedAmount === 'number') {
          item.unpayedAmount = item.unpayedAmount.toFixed(2);
        }
        item['_index'] = index;
        return item;
      });
      this.invoiceTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.invoiceTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 高级搜索收起
  public fullSearch() {
    this.fullSearchShow = !this.fullSearchShow;
  }

  public fullSearchClose() {
    this.fullSearchShow = false;
  }

  public fullSearchReset() {
    this.filters = {};
    this.getInvoiceList();
  }

  public refresh() {
    this.filters.id = '';
    this.filters.purchaseNo = '';
    this.filters.invoiceBillId = '';
    this.filters.supplierName = '';
    this.filters.businessEntity = '';
    this.filters.state = '';
    this.filters.creator = '';
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.getInvoiceList();
  }

  public goToMatchOrder() {
    this.tabPageType = 3;
    this.matchFilters = {};
    this.invoiceMatchTableConfig.pageNum = 1;
    this.invoiceMatchTableConfig.pageSize = 10;
    this.receiveDateRange = null;
    this.searchMarch();
  }
  // 匹配交货查询
  public searchMarch = () => {
    Object.keys(this.matchFilters).forEach((item: string) => {
      if (typeof this.matchFilters[item] === 'string') {
        this.matchFilters[item] = this.matchFilters[item].trim();
      }
    });
    if (this.receiveDateRange === null || this.receiveDateRange.length === 0) {
      this.matchFilters['start_Date'] = '';
      this.matchFilters['end_Date'] = '';
    } else {
      this.matchFilters['start_Date'] =  this.ufastUtilService.getStartDate(this.receiveDateRange[0]).toUTCString();
      this.matchFilters['end_Date'] = this.ufastUtilService.getEndDate(this.receiveDateRange[1]).toUTCString();
    }
    const filter = {
      pageNum: this.invoiceMatchTableConfig.pageNum,
      pageSize: this.invoiceMatchTableConfig.pageSize,
      filters: this.matchFilters
    };
    this.invoiceMatchTableConfig.loading = true;
    this.invoiceMatchTableConfig.checkAll = false;
    this.invoiceMatchDataList = [];
    this.invoiceService.getChildInvoice(filter).subscribe((resData: InvoiceServiceNs.UfastHttpResT<any>) => {
      this.invoiceMatchTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      if (!(resData.value instanceof Object)) {
        return;
      }
      this.invoiceMatchDataList = resData.value.list;
      // 将后台传过来的接收行号和行号拼接成新的字段接收号-行号
      this.invoiceMatchDataList.forEach((item: any) => {
        item.acceptNoAndRowNow = item['acceptNo'] + '-' + item['acceptRowNo'];
      });
      this.invoiceMatchTableConfig.total = resData.value.total;
    }, (error: any) => {
      this.invoiceMatchTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 匹配交货查询重置
  private searchMarchReset() {
    this.matchFilters = {};
    this.receiveDateRange = null;
    this.searchMarch();
  }

  private getTaxCodeList() {
    this.invoiceService.getTaxCode().subscribe((resData: InvoiceServiceNs.UfastHttpResT<any>) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.taxCodeDateList = resData.value;
    }, (error: any) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  // 修改查看时填充金额合计栏数据
  resetCountForm() {
    this.invoiceNumCountCalculation = null;
    this.lineAmountCountCalculation = null;
    this.taxCountCalculation = null;
    this.totalMoneyCountCalculation = null;

    for (let i = 0, len = this.invoiceDataChildList.length; i < len; i++) {
      this.invoiceNumCountCalculation += this.invoiceDataChildList[i].quantityRealCalculation;
      this.lineAmountCountCalculation += this.invoiceDataChildList[i].rowAmountRealCalculation;
      this.taxCountCalculation += this.invoiceDataChildList[i].taxAmountRealCalculation;
    }

    if (this.invoiceDataChildList.length === 0) {
      this.inoviceForm.patchValue({supplierName: ''});
    } else {
      if (this.lineAmountCountCalculation || this.taxCountCalculation) {
        this.lineAmountCountCalculation = parseFloat(this.lineAmountCountCalculation.toFixed(2));
        this.taxCountCalculation = parseFloat(this.taxCountCalculation.toFixed(2));
      }
      this.totalMoneyCountCalculation = this.ufastUtilService.add(this.lineAmountCountCalculation, this.taxCountCalculation);
    }
    this.countForm.patchValue({
      invoiceNumCount: this.invoiceNumCountCalculation,
      lineAmountCount: this.lineAmountCountCalculation,
      taxCount: this.taxCountCalculation,
      totalMoneyCount: this.totalMoneyCountCalculation,
    });
  }

  // 查看、修改时填充表单数据并切换对应的标签的内容
  public addOrEditInvoiceTab(type: number, item?: InvoiceServiceNs.EditInvoiceChildModel) {
    this.tabPageType = type;
    if (this.tabPageType === TabPageType.EditPage) {
      // this.getTaxCodeList();
      this.operateInvoiceId = item.id;
      this.addOrEditPage = 'editPage';
      // 清空FORM表单数据
      this.countForm.reset();
      this.invoiceService.getInvoiceDetail(item.id).subscribe((resData: InvoiceServiceNs.UfastHttpResT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'warning');
          return;
        }
        this.invoiceDataChildList = [];

        const formValue = {};
        Object.keys(this.inoviceForm.getRawValue()).forEach((key) => {
          formValue[key] = resData.value.invoiceVO[key];
        });
        formValue['billCreateDate'] = new Date(resData.value.invoiceVO.billCreateDate);
        this.inoviceForm.patchValue(formValue);
        resData.value.invoiceAcceptanceVOs.forEach((itemData: any) => {
          const temp = {
            businessEntity: itemData.acceptanceVO.businessEntity,
            taxCode: itemData.acceptanceVO.taxRateId,
            taxRate: itemData.acceptanceVO.taxRate,
            taxRateId: itemData.acceptanceVO.taxRateId,
            acceptNo: itemData['acceptNo'],
            acceptRowNo: itemData['acceptRowNo'],
            billWithoutaxPriceRealCalculation: itemData['billWithoutaxPrice'],
            id: itemData['id'],
            invoiceId: itemData['purchaseNo'],
            quantity: itemData.acceptanceVO['quantity'],
            quantityRealCalculation: itemData['quantity'],
            taxCodeRealCalculation: itemData.acceptanceVO['taxRateId'],
            purchaseType: itemData.acceptanceVO['purchaseType'],
            purchaseNo: itemData.acceptanceVO['purchaseNo'],
            materialsNo: itemData.acceptanceVO['materialsNo'],
            materialsName: itemData.acceptanceVO['materialsName'],
            unit: itemData.acceptanceVO['unit'],
            currencyType: itemData.acceptanceVO['currencyType'],
            unitPriceWithouttax: itemData.acceptanceVO['unitPriceWithouttax'],
            processor: itemData.acceptanceVO['processor'],
            processorName: itemData.acceptanceVO['processorName'],
            supplierNo: itemData.acceptanceVO['supplierNo'],
            rowNo: itemData['rowNo'],
            rowAmountRealCalculation: itemData['rowAmount'],
            taxAmountRealCalculation: itemData['taxAmount'],
          };
          // 将后台取到的税码ID转成对应的索引
          for (let i = 0, len = this.taxCodeDateList.length; i < len; i++) {
            if (this.taxCodeDateList[i].taxRateId + '' === temp['taxRateId'] + '') {
              temp['taxCodeRealCalculation'] = i;
              break;
            }
          }
          let taxRate = 0;
          if (this.taxCodeDateList[temp.taxCodeRealCalculation]) {
            taxRate = this.ufastUtilService.div(this.taxCodeDateList[temp.taxCodeRealCalculation].taxRate, 100);
          }

          temp['unitPriceWithtax'] = this.fixedDec(this.ufastUtilService.mul(this.ufastUtilService.add(taxRate, 1),
            temp.billWithoutaxPriceRealCalculation), 2);
          temp['totalAmount'] = this.fixedDec(this.ufastUtilService.add(temp.rowAmountRealCalculation, temp.taxAmountRealCalculation), 2);

          this.matchItemList.forEach((key: string) => {
            if (temp[key] === undefined) {
              temp[key] = itemData.acceptanceVO[key];
            }
          });
          this.verifyTotalAmount(temp);
          this.invoiceDataChildList.push(temp);
        });
        this.resetCountForm();
      }, (error: any) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    } else if (this.tabPageType === TabPageType.AddPage) {
      this.operateInvoiceId = undefined;
      this.addOrEditPage = 'addPage';
      this.invoiceDataChildList = [];
      this.countForm.reset();
      // this.getTaxCodeList();
    } else if (this.tabPageType === TabPageType.DetailPage) {
      this.detailInvoice = {};
      this.invoiceService.getInvoiceDetail(item.id).subscribe((resData: InvoiceServiceNs.UfastHttpResT<any>) => {
        if (resData.code !== 0) {
          this.messageService.showToastMessage(resData.message, 'error');
          this.invoiceDataChildList = [];
          return;
        }
        this.detailInvoice = resData.value.invoiceVO;
        this.invoiceDataChildList = [];
        resData.value.invoiceAcceptanceVOs.forEach((itemData: any) => {
          const temp = {
            acceptNo: itemData['acceptNo'],
            acceptRowNo: itemData['acceptRowNo'],
            billWithoutaxPrice: itemData['billWithoutaxPrice'],
            id: itemData['id'],
            invoiceId: itemData['purchaseNo'],
            quantity: itemData.acceptanceVO['quantity'],
            toMatchQuantity: itemData['quantity'],
            rowAmount: parseFloat(itemData['rowAmount'].toFixed(2)),
            taxAmount: parseFloat(itemData['taxAmount'].toFixed(2)),
            taxCode: itemData.acceptanceVO['taxCode'],
            rowNo: itemData['rowNo'],
            purchaseType: itemData.acceptanceVO['purchaseType'],
            purchaseNo: itemData.acceptanceVO['purchaseNo'],
            materialsNo: itemData.acceptanceVO['materialsNo'],
            materialsName: itemData.acceptanceVO['materialsName'],
            unit: itemData.acceptanceVO['unit'],
            currencyType: itemData.acceptanceVO['currencyType'],
            unitPriceWithouttax: itemData.acceptanceVO['unitPriceWithouttax'],
            processor: itemData.acceptanceVO['processor'],
            processorName: itemData.acceptanceVO['processorName']
          };
          temp['totalAmount'] = this.fixedDec(this.ufastUtilService.add(temp.rowAmount, temp.taxAmount), 2);
          const taxRate = this.ufastUtilService.div(itemData.acceptanceVO['taxRate'], 100);
          temp['unitPriceWithtax'] = this.fixedDec(this.ufastUtilService.mul(this.ufastUtilService.add(taxRate, 1),
            temp['unitPriceWithouttax']), 2);
          this.invoiceDataChildList.push(temp);
        });
      }, (error: any) => {
        this.messageService.showAlertMessage('', error.message, 'error');
      });
    } else {
      return;
    }
  }
  // 删除发票联系单
  public deleteInvoice(item: InvoiceServiceNs.EditInvoiceChildModel) {

    this.messageService.showAlertMessage('', '确定要删除吗?', 'confirm').afterClose.subscribe((type: string) => {
      if (type !== 'onOk') {
        return;
      }
      this.commonResDeal(this.invoiceService.deleteInvoice(item.id), true);
    });
  }

  // 删除发票联系单行数据
  public deleteInvoiceChild(item: number) {
    const rowIndex = (this.invoiceChildTableConfig.pageNum - 1) * this.invoiceChildTableConfig.pageSize + item;
    this.invoiceDataChildList.splice(rowIndex, 1);

    this.messageService.showToastMessage('删除成功!', 'success');
    if (this.tabPageType === TabPageType.AddPage) {
      this.invoiceDataChildList = this.invoiceDataChildList.map((rowData: any, index: number) => {
        rowData['rowNo'] = index + 1;
        return rowData;
      });
    } else {
      this.invoiceDataChildList = this.invoiceDataChildList.map(row => row);
    }
    this.resetCountForm();
  }
  public saveOrder () {
    let handler;
    if (this.tabPageType === TabPageType.AddPage) {
      handler = this.invoiceService.addInvoice.bind(this.invoiceService);
    } else if (this.tabPageType === TabPageType.EditPage) {
      handler = this.invoiceService.editInvoice.bind(this.invoiceService);
    } else {}
    this.doSubmitOrder(handler);
  }
  public submitOrder() {
    this.doSubmitOrder(this.invoiceService.submitApproval.bind(this.invoiceService));
  }
  private doSubmitOrder(handler: Function) {
    for (const key of Object.keys(this.inoviceForm.controls)) {
      this.inoviceForm.controls[key].markAsDirty();
      this.inoviceForm.controls[key].updateValueAndValidity();
    }

    if (this.inoviceForm.invalid) {
      return;
    }
    const invoiceAcceptanceVOs: InvoiceServiceNs.EditInvoiceChildAcceptModel[] = [];
    this.invoiceDataChildList.forEach((item: any) => {
      if (!item.taxCodeIdCalculation) {
        item.taxCodeIdCalculation =
          this.taxCodeDateList[item.taxCodeRealCalculation] ? this.taxCodeDateList[item.taxCodeRealCalculation].taxRateId : '';
      }
      invoiceAcceptanceVOs.push({
        rowNo: item['rowNo'],
        acceptNo: item['acceptNo'],
        acceptRowNo: item['acceptRowNo'],
        quantity: item['quantityRealCalculation'],
        billWithoutaxPrice: item['billWithoutaxPriceRealCalculation'],
        rowAmount: item['rowAmountRealCalculation'],
        taxCode: item['taxCodeIdCalculation'],
        taxAmount: item['taxAmountRealCalculation'],
        id: item['id'],
        invoiceId: item['purchaseNo']
      });
    });

    const invoiceVO: InvoiceServiceNs.EditInvoiceChildModel = Object.assign({id: this.operateInvoiceId}, this.inoviceForm.getRawValue());
    if (this.inoviceForm.controls['rowAmount'].value !== this.countForm.controls['lineAmountCount'].value) {
      this.messageService.showToastMessage('发票头"发票行金额合计"与发票行的"行金额合计"存在差异,请修正后再提交!', 'error');
      return;
    }
    if (this.inoviceForm.controls['billAmount'].value !== this.countForm.controls['totalMoneyCount'].value) {
      this.messageService.showToastMessage('发票头"发票金额"与发票行的"总金额合计"存在差异,请修正后再提交!', 'error');
      return;
    }
    if (this.inoviceForm.controls['taxAmount'].value !== this.countForm.controls['taxCount'].value) {
      this.messageService.showToastMessage('发票头"发票税额合计"与发票行的"税额合计"存在差异,请修正后再提交!', 'error');
      return;
    }
    this.messageService.showLoading('数据处理中，请等待...');
    handler(invoiceAcceptanceVOs, invoiceVO).subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('操作成功', 'success');
      this.toggleManagePage();
    }, (error: any) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  // public addOrEditSubmit(approval?: number) {
  //   for (const key of Object.keys(this.inoviceForm.controls)) {
  //     this.inoviceForm.controls[key].markAsDirty();
  //     this.inoviceForm.controls[key].updateValueAndValidity();
  //   }
  //
  //   if (this.inoviceForm.invalid) {
  //     return;
  //   }
  //   let observer: any = null;
  //
  //   const invoiceAcceptanceVOs: InvoiceServiceNs.EditInvoiceChildAcceptModel[] = [];
  //   this.invoiceDataChildList.forEach((item: any) => {
  //     if (!item.taxCodeIdCalculation) {
  //       item.taxCodeIdCalculation =
  //         this.taxCodeDateList[item.taxCodeRealCalculation] ? this.taxCodeDateList[item.taxCodeRealCalculation].taxRateId : '';
  //     }
  //     invoiceAcceptanceVOs.push({
  //       rowNo: item['rowNo'],
  //       acceptNo: item['acceptNo'],
  //       acceptRowNo: item['acceptRowNo'],
  //       quantity: item['quantityRealCalculation'],
  //       billWithoutaxPrice: item['billWithoutaxPriceRealCalculation'],
  //       rowAmount: item['rowAmountRealCalculation'],
  //       taxCode: item['taxCodeIdCalculation'],
  //       taxAmount: item['taxAmountRealCalculation'],
  //       id: item['id'],
  //       invoiceId: item['purchaseNo']
  //     });
  //   });
  //
  //   const invoiceVO: InvoiceServiceNs.EditInvoiceChildModel = Object.assign({id: this.operateInvoiceId}, this.inoviceForm.value);
  //   if (this.inoviceForm.controls['rowAmount'].value !== this.countForm.controls['lineAmountCount'].value) {
  //     this.messageService.showToastMessage('发票头"发票行金额合计"与发票行的"行金额合计"存在差异,请修正后再提交!', 'error');
  //     return;
  //   }
  //   if (this.inoviceForm.controls['billAmount'].value !== this.countForm.controls['totalMoneyCount'].value) {
  //     this.messageService.showToastMessage('发票头"发票金额"与发票行的"总金额合计"存在差异,请修正后再提交!', 'error');
  //     return;
  //   }
  //   if (this.inoviceForm.controls['taxAmount'].value !== this.countForm.controls['taxCount'].value) {
  //     this.messageService.showToastMessage('发票头"发票税额合计"与发票行的"税额合计"存在差异,请修正后再提交!', 'error');
  //     return;
  //   }
  //   if (this.tabPageType === TabPageType.AddPage && approval !== 5) {
  //     observer = this.invoiceService.addInvoice(invoiceAcceptanceVOs, invoiceVO);
  //   } else if (this.tabPageType === TabPageType.EditPage && approval !== 5) {
  //     observer = this.invoiceService.editInvoice(invoiceAcceptanceVOs, invoiceVO);
  //   } else if (approval === 5) {
  //     observer = this.invoiceService.submitApproval(invoiceAcceptanceVOs, invoiceVO);
  //   } else {
  //     return;
  //   }
  //   this.messageService.showLoading('数据处理中，请等待...');
  //   observer.subscribe((resData: NewsServiceNs.NewsResModelT<any>) => {
  //     this.messageService.closeLoading();
  //     if (resData.code === 0) {
  //       this.messageService.showToastMessage('操作成功', 'success');
  //       this.toggleManagePage();
  //       if (approval !== 5) {
  //         // this.getInvoiceList();
  //         this.toggleManagePage();
  //       }
  //     } else {
  //       this.messageService.showToastMessage(resData.message, 'error');
  //     }
  //   }, (error: any) => {
  //     this.messageService.closeLoading();
  //     this.messageService.showAlertMessage('', error.message, 'error');
  //   });
  // }

  public addMatchResultCommon(row: number, matchOrderResult: any[]) {
    this.tabPageType = row;

    this.invoiceService.getSupplierDetail(matchOrderResult[0].supplierNo).subscribe((resData: InvoiceServiceNs.UfastHttpResT<any>) => {
      this.invoiceTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      if (resData.value === null) {
        return;
      }
      this.inoviceForm.patchValue({
        billAccountNo: resData.value.receiptBankAccount ,
        billBank: resData.value.receiptBank,
        billBankAddress: resData.value.receiptBankAddress ,
      });
    }, (error: any) => {
      this.invoiceChildTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
    // 将选中的数据添加进行数据
    // 计算行号
    let maxRowNo = this.invoiceDataChildList.length + 1;
    if (this.tabPageType === TabPageType.EditPage) {
      this.invoiceDataChildList.forEach((item) => {
        maxRowNo = item.rowNo > maxRowNo ? item.rowNo : maxRowNo;
      });
    }
    matchOrderResult.forEach((item: any, index: number) => {
      item.rowNo = maxRowNo + index;
      this.invoiceDataChildList.push(item);
      this.inoviceForm.controls['supplierName'].setValue(item['supplierName']);
    });
    // 将后台取到的税码ID转成对应的索引, 对需要进行实时计算的字段进行填充
    for (let i = this.invoiceChildDataListPreLength, len = this.invoiceDataChildList.length; i < len; i++) {
      this.invoiceDataChildList[i].totalAmount = this.invoiceDataChildList[i].taxAmount + this.invoiceDataChildList[i].rowAmount;
      for (let j = 0, len2 = this.taxCodeDateList.length; j < len2; j++) {
        if (this.taxCodeDateList[j].taxRateId + '' === this.invoiceDataChildList[i].taxRateId + '') {
          this.invoiceDataChildList[i].taxCodeRealCalculation = j;
          break;
        }
      }
      this.invoiceDataChildList[i].quantityRealCalculation = this.invoiceDataChildList[i].toMatchQuantity;
      this.invoiceDataChildList[i].billWithoutaxPriceRealCalculation = this.invoiceDataChildList[i].unitPriceWithouttax;
      this.calcRowDataMoney(this.invoiceDataChildList[i]);
    }
    this.resetCountForm();
    this.inoviceForm.patchValue({
      salesmanErpCode: matchOrderResult[0].processor
    });
    matchOrderResult = [];
  }
  public cancelMatch() {
    if (this.addOrEditPage === 'addPage') {
      this.backInvoiceAddPage();
    } else {
      this.backInvoiceEditPage();
    }
  }
  // 将匹配确认的添加到行数据中
  public addMatchResult() {
    const matchOrderResult: any[] = this.invoiceMatchDataList.filter(item => item[this.invoiceMatchTableConfig.checkRowField]);
    if (matchOrderResult.length === 0) {
      this.messageService.showToastMessage('请选择需要匹配的订单', 'info');
      return;
    }
    const row = this.addOrEditPage === 'addPage' ? 1 : 2;
    // 必须符合要求才能添加到行数据中
    if (!this.invoiceDataChildList.length) {
      for (let i = 0, len = matchOrderResult.length; i < len; i++) {
        let flag = 0;
        for (let j = 1; j < len - i; j++) {
          if (!this.isMatchedOrder(matchOrderResult[i], matchOrderResult[j])) {
            flag = 1;
            this.messageService.showToastMessage('税码、币种、采购物料类型、所属公司、结算方式、采购业务员、收货方、收单方、供应商不同，不能添加到同一个发票联系单!', 'error');
            return;
          }
          if (matchOrderResult[i].purchaseNo !== matchOrderResult[j].purchaseNo) {
            this.messageService.showAlertMessage('', '合并开票将影响财务支付效率，建议单笔合同开票！确定继续合并开票？', 'confirm').afterClose.subscribe((type: string) => {
              if (type === 'onOk') {
                this.invoiceChildDataListPreLength = this.invoiceDataChildList.length;
                this.addMatchResultCommon(row, matchOrderResult);
              }
            });
            return;
          }
        }
        if (flag === 1) {
          // matchOrderResult = [];
          return;
        }
      }
    }
    if (this.invoiceDataChildList.length) {
      let flag = 0;
      for (let k = 0, len1 = this.invoiceDataChildList.length; k < len1; k++) {
        for (let i = 0, len2 = matchOrderResult.length; i < len2; i++) {
          if (!this.isMatchedOrder(this.invoiceDataChildList[k], matchOrderResult[i])
            || this.taxCodeDateList[this.invoiceDataChildList[k].taxCodeRealCalculation].taxRateId + '' !==
            matchOrderResult[i].taxRateId + '') {
            flag = 1;
            this.messageService.showToastMessage('税码、币种、采购物料类型、所属公司、结算方式、采购业务员、收货方、收单方、供应商不同，不能添加到同一个发票联系单!', 'error', 4000);
            return;
          }
          // 添加行数据是否重复判断
          if (this.invoiceDataChildList[k]['acceptNo'] === matchOrderResult[i]['acceptNo'] &&
            this.invoiceDataChildList[k]['acceptRowNo'] === matchOrderResult[i]['acceptRowNo']) {
            flag = 1;
            this.messageService.showToastMessage('请勿重复添加!', 'error', 4000);
            return;
          }
          // 提示不同合同开票到统一发票联系单
          if (this.invoiceDataChildList[k]['purchaseNo'] !== matchOrderResult[i]['purchaseNo']) {
            this.messageService.showAlertMessage('', '合并开票将影响财务支付效率，建议单笔合同开票！确定继续合并开票？', 'confirm').afterClose.subscribe((type: string) => {
              if (type === 'onOk') {
                this.invoiceChildDataListPreLength = this.invoiceDataChildList.length;
                this.addMatchResultCommon(row, matchOrderResult);
              }
            });
            return;
          }
        }
      }
      if (flag === 1) {
        // matchOrderResult = [];
        return;
      }
    }
    this.invoiceChildDataListPreLength = this.invoiceDataChildList.length;
    this.addMatchResultCommon(row, matchOrderResult);
  }

  /**
  打印涉及到的相关函数
   **/
  showPrintModal(row: any): void {
    if (!this.lodopService.isInitSuccess()) {
      this.printErrorService.showInitError();
      return;
    }
    this.invoiceId = row.id;
    this.printIsVisible = true;
  }


  printHandleCancel(): void {
    this.printIsVisible = false;
  }

  public getInvoiceDetail(btn: string) {
    this.invoiceTableConfig.loading = true;
    this.invoiceService.getInvoiceDetail(this.invoiceId).subscribe((resData: InvoiceServiceNs.UfastHttpResT<any>) => {
      this.invoiceTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'warning');
        return;
      }
      this.printData = {
        orderNo: resData.value.invoiceVO.code,
        invoiceDate: resData.value.invoiceVO.billCreateDate,
        goodsPrice: resData.value.invoiceVO.billAmount,
        transportFees: resData.value.invoiceVO.transportFees,
        prepayments: resData.value.invoiceVO.prepayments,
        warranty: resData.value.invoiceVO.warranty,
        deduction: resData.value.invoiceVO.deduction,
        total: resData.value.invoiceVO.billAmount + resData.value.invoiceVO.transportFees -
        resData.value.invoiceVO.prepayments - resData.value.invoiceVO.warranty - resData.value.invoiceVO.deduction,
        invoiceBillId: resData.value.invoiceVO.invoiceBillId,
        billNum: resData.value.invoiceVO.billNum,
        purchaseNos: resData.value.invoiceAcceptanceVOs[0].purchaseNo,
        payee: resData.value.invoiceVO.supplierName,
        payeeAddress: resData.value.invoiceVO.billBankAddress,
        billBankAddress: resData.value.invoiceVO.billBank,
        billAccountNo: resData.value.invoiceVO.billAccountNo,
        printDir: this.printDir
      };
      if (!this.lodopService.isInitSuccess()) {
        this.messageService.showAlertMessage('', '打印插件初始化失败', 'error');
        return;
      }
      if (btn === 'print') {
        this.lodopService.print(InvoiceContactTplComponent, this.printData, 'data');
      }
      if (btn === 'preview') {
        this.lodopService.preview(InvoiceContactTplComponent, this.printData, 'data');
      }
    }, (error: any) => {
      this.invoiceTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }

  public print() {
    this.printIsVisible = false;

  }
  public preview(btn: string) {
    this.ufastUtilService.setLocalData(localDataKeyObj.invoiceContactPrintDir, this.printDir);
    this.getInvoiceDetail(btn);
    this.printIsVisible = false;
  }
  public auditAgree() {
    this.isAuditReject = false;
    this.auditSubmitData = {
      comments: '',
      params: {direction: WorkBoardServiceNs.AuditDirection.Agree, amount: this.detailInvoice.rowAmount},
      toCompleteTasks: [{taskId: this.auditFlowData['taskId'], processInstanceId: this.auditFlowData['processInstanceId']}]
    };
    this.auditModalShow = true;
  }
  public auditReject() {
    this.isAuditReject = true;
    this.auditSubmitData = {
      comments: '',
      params: {direction: WorkBoardServiceNs.AuditDirection.Reject, amount: this.detailInvoice.rowAmount},
      toCompleteTasks: [{taskId: this.auditFlowData['taskId'], processInstanceId: this.auditFlowData['processInstanceId']}]
    };
    this.auditModalShow = true;
  }
  public cancelAuditModal() {
    this.auditModalShow = false;
  }
  public confirmAuditModal() {
    if (this.isAuditReject && !this.auditSubmitData.comments) {
      this.messageService.showToastMessage('审批意见必填', 'error');
      return;
    }
    this.auditModalShow = false;
    let conditionHandler = Observable.of('');
    if (this.auditSubmitData.params.direction === WorkBoardServiceNs.AuditDirection.Reject) {
      conditionHandler = this.invoiceService.updateStateToRefused(this.auditFlowData.billId);
    }
    if (this.auditSubmitData.params.direction === WorkBoardServiceNs.AuditDirection.Agree &&
      this.workBoardService.isNeedPreAgree(this.approveInfo.endConditions, this.detailInvoice.rowAmount)) {
      conditionHandler = this.invoiceService.updateStateToFinish(this.auditFlowData.billId);
    }
    conditionHandler.subscribe(() => {
      this.workBoardService.auditOrder(this.auditSubmitData).subscribe(() => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.detailReturn();
      });
    });
  }
  public viewAuditHistory() {
    this.showAuditHistory = !this.showAuditHistory;
  }
  ngOnInit() {
    this.invoiceTableConfig = {
      id: 'cloudSettle-invoiceContact',
      pageSize: 10,
      pageNum: 1,
      total: 0,
      pageSizeOptions: [10, 20, 30, 40, 50],
      loading: false,
      splitPage: true,
      showPagination: true,
      showCheckbox: false,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 150, fixed: true},
        {title: '发票联系单号', tdTemplate: this.idTpl, width: 190, fixed: true},
        {title: '状态', field: 'state', width: 80, pipe: 'invoiceState'},
        {title: 'ERP发票联系单号', field: 'erpId', width: 160},
        {title: '采购合同', field: 'purchaseNos', width: 160},
        {title: '发票编号', field: 'invoiceBillId', width: 100},
        {title: '发票日期', field: 'billCreateDate', width: 100, pipe: 'date:yyyy-MM-dd'},
        {title: '发票金额', field: 'billAmount', width: 100},
        {title: '已付金额', tdTemplate: this.payedAmountTpl, width: 100},
        {title: '未付金额', field: 'unpayedAmount', width: 100},
        {title: '供应商编号', field: 'supplierNo', width: 100},
        {title: '供应商名称', field: 'supplierName', width: 160},
        {title: '税码', field: 'taxCode', width: 80},
        {title: '创建人', field: 'creator', width: 100}
      ]
    };
    this.invoiceMatchTableConfig = {
      pageSize: 10,
      pageNum: 1,
      total: 0,
      pageSizeOptions: [10, 20, 30, 40, 50],
      loading: false,
      splitPage: true,
      showPagination: true,
      showCheckbox: true,
      checkRowField: '_checked',
      headers: [
        {title: '采购订单号', field: 'purchaseNo', width: 160},
        {title: '类型', field: 'purchaseType', width: 60},
        {title: '物料编码', field: 'materialsNo', width: 120},
        {title: '物料描述', field: 'materialsName', width: 200},
        {title: '单位', field: 'unit', width: 80},
        {title: '接收日期', field: 'storageTime', width: 100, pipe: 'date:yyyy-MM-dd'},
        {title: '接收数量', field: 'quantity', width: 90},
        {title: '币种', field: 'currencyType', width: 80},
        {title: '采购业务员', field: 'processorName', width: 120},
        {title: '收货方', field: 'goodsReceivor', width: 130},
        {title: '收单方', field: 'billReceivor', width: 160},
        {title: '接收号-行号', field: 'acceptNoAndRowNow', width: 100},
      ]
    };
    this.inoviceForm = this.formBuilder.group({
      supplierName: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      billAmount: [null, [Validators.required, Validators.min(0), Validators.max(MaxInputNumber)]],
      billAccountNo: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      transportFees: [null, [Validators.min(0), Validators.max(MaxInputNumber)]],
      deduction: [null, [Validators.min(0), Validators.max(MaxInputNumber)]],
      invoiceBillId: [null, [Validators.required, Validators.maxLength(this.MaxInputLenEnum.Default)]],
      rowAmount: [null, [Validators.required, Validators.min(0), Validators.max(MaxInputNumber)]],
      billBank: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      prepayments: [null, [Validators.min(0), Validators.max(MaxInputNumber)]],
      billNum: [null, [Validators.min(0), Validators.max(MaxInputNumber)]],
      billCreateDate: [null],
      taxAmount: [null, [Validators.required, Validators.min(0), Validators.max(MaxInputNumber)]],
      billBankAddress: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      warranty: [null, [Validators.min(0), Validators.max(MaxInputNumber)]],
      description: [null, [Validators.maxLength(this.MaxInputLenEnum.Default)]],
      salesmanErpCode: [null]
    });
    this.countForm = this.formBuilder.group({
      invoiceNumCount: [{value: null, disabled: true}],
      lineAmountCount: [{value: null, disabled: true}],
      taxCount: [{value: null, disabled: true}],
      totalMoneyCount: [{value: null, disabled: true}]
    });
    this.getInvoiceList();
    this.getTaxCodeList();
    this.activatedRouter.queryParams.subscribe((data: any) => {
      if (data['isAuditFlow'] !== WorkBoardServiceNs.AuditFlowRouteParam.IsAuditFlow) {
        return;
      }
      this.auditFlowData = Object.assign(this.auditFlowData, data);
      this.showAuditFlowBtu = this.auditFlowData['isAudit'] === WorkBoardServiceNs.AuditFlowRouteParam.Audit;
      if (this.showAuditFlowBtu) {
        this.getApprovalOrderInfo(this.auditFlowData['processInstanceId']);
      }
      if (!data.billId) {
        this.messageService.showToastMessage('无效单据号', 'error');
        return;
      }
      this.addOrEditInvoiceTab(TabPageType.DetailPage, <any>{id: data.billId});
    });
  }
  private getApprovalOrderInfo(processInstanceId: string) {
    this.workBoardService.getApproveInfo(processInstanceId).subscribe((resData: any) => {
      // this.auditFlowData.toEndCondition = resData.value['toEndCondition'];
      this.approveInfo = resData.value;
    });
  }
}
