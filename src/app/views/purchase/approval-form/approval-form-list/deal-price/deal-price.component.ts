import {Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import {ApprovalFormNs, ApprovalFormService} from '../../../../../core/trans/purchase/approval-form.service';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {environment} from '../../../../../../environments/environment';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {Router} from '@angular/router';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
interface TableConfig extends UfastTableNs.TableConfig {
  xScroll: string;
}
enum TabIndexEnum {
  WaitDeal,
  SwitchWay,
  WaitBack,
  Confirm
}
interface DealRowData {
  index?: number;
  purchaseNum: number;
  dealNum: number;
  remainBackNum: number;
  rowData: ApprovalFormNs.ApprovalFormDealRowData;
}
@Component({
  selector: 'app-deal-price',
  templateUrl: './deal-price.component.html',
  styleUrls: ['./deal-price.component.scss']
})
export class DealPriceComponent implements OnInit {
  @Input() formId: string;
  @Output()finish: EventEmitter<any>;
  @ViewChild('numberTpl')numberTpl: TemplateRef<any>;
  TabIndexType = TabIndexEnum;
  RowDealStatus = ApprovalFormNs.RowDealStatus;
  fieldList: {field: string; name: string; pipe?: string}[];
  tableDataList: ApprovalFormNs.ApprovalFormDealRowData[];
  purchaseInfo: any;
  tableConfig: TableConfig;
  tabIndex: number;
  supplierTableConfig: UfastTableNs.TableConfig;
  supplierPriceSumConfig: UfastTableNs.TableConfig;
  supplierPriceDataList: any[];
  supplierDataList: any[];
  materialNumDec = environment.otherData.materialNumDec;
  materialNumMin = environment.otherData.materialNumMin;
  materialNumMax = environment.otherData.materialNumMax;
  dealRowData: DealRowData;
  dealRowModalShow: boolean;
  switchWayModalShow: boolean;
  purchaseWayList: ApprovalFormNs.PurchaseWay[];
  selectedPurchaseWay: ApprovalFormNs.PurchaseWay;
  selectedRow: ApprovalFormNs.ApprovalFormDealRowData;
  constructor(private approvalFormService: ApprovalFormService, private messageService: ShowMessageService,
              private router: Router, private utilService: UfastUtilService) {
    this.dealRowModalShow = false;
    this.switchWayModalShow = false;
    this.finish = new EventEmitter<any>();
    this.supplierDataList = [];
    this.supplierPriceDataList = [];
    this.tableDataList = [];
    this.tabIndex = 0;
    this.purchaseInfo = {
      changeMethodList: [],
      backList: [],
      resolvingList: [],
      confirmList: []
    };
    this.dealRowData = {
      index: null,
      purchaseNum: null,
      dealNum: null,
      remainBackNum: null,
      rowData: null
    };
    this.fieldList = [
      { name: '审批表编号', field: 'approveNo'},
      { name: '状态', field: 'status', pipe: 'purchaseApprovalStatus'},
      { name: '创建人', field: 'creatorName'},
      { name: '采购模式', field: 'purchaseType', pipe: 'purchaseMode'},
      { name: '采购方式', field: 'purchaseMethod', pipe: 'purchaseWay'},
      { name: '创建时间', field: 'createDate', pipe: 'date:yyyy-MM-dd HH:mm:ss'},
    ];
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public exitPage() {
    this.finish.emit();
  }
  private getPriceSumInfo() {
    this.approvalFormService.getSupplierSumPrice(this.formId).subscribe((resData) => {
      this.supplierPriceDataList = resData.value || [];
      this.supplierPriceDataList.forEach((item: any, index: number) => {
        item.index = index + 1;
      });
    });
  }
  private getDetailInfo() {
    this.approvalFormService.getApproveDealPrice(this.formId).subscribe((resData) => {
      this.getPriceSumInfo();
      this.purchaseInfo = resData.value;
      this.initTabData();
    });
  }
  private initTabData() {
    let basicWidth = 1500;      // 操作栏宽度不同
    switch (this.tabIndex) {
      case TabIndexEnum.WaitDeal:
        this.tableDataList = this.purchaseInfo.resolvingList;
        break;
      case TabIndexEnum.SwitchWay:
        basicWidth = 1550;
        this.tableDataList = this.purchaseInfo.changeMethodList;
        break;
      case TabIndexEnum.WaitBack:
        this.tableDataList = this.purchaseInfo.backList;
        break;
      case TabIndexEnum.Confirm:
        this.tableDataList = this.purchaseInfo.confirmList;
        break;
      default:
        this.tableDataList = [];
    }
    if (this.tableDataList.length > 0) {
      this.tableConfig.xScroll = basicWidth + 200 * this.tableDataList[0].priceRecordVOList.length + 'px';
    } else {
      this.tableConfig.xScroll = basicWidth + 'px';
    }
  }
  public changeTab(index: number) {
    this.initTabData();
  }
  public checkedAllRow(value: boolean) {
    this.tableDataList.forEach((item) => {
      item.purchaseApproveFullDetailVO[this.tableConfig.checkRowField] = value;
    });
  }
  public checkedSingleRow(value: boolean) {
    if (!value) {
      this.tableConfig.checkAll = false;
      return;
    }
    const unCheckedItem = this.tableDataList.find(item => !item.purchaseApproveFullDetailVO[this.tableConfig.checkRowField]);
    this.tableConfig.checkAll = unCheckedItem ? false : true;
  }
  /**
   * 处理数量变化*/
  public onDealNumChange() {
    let dealSum = 0;
    this.dealRowData.rowData.priceRecordVOList.forEach((item) => {
      if (typeof item['_dealNumber'] !== 'number') {
        return;
      }
      dealSum = this.utilService.add(dealSum, item['_dealNumber']);
    });
    this.dealRowData.dealNum = dealSum;
    this.dealRowData.remainBackNum = this.utilService.sub(this.dealRowData.purchaseNum, dealSum);
  }
  /**
   * 转换采购方式*/
  public switchWay(rowData: ApprovalFormNs.ApprovalFormDealRowData) {
    this.switchWayModalShow = true;
    this.selectedRow = rowData;
    const purchaseMethod = rowData.purchaseApproveFullDetailVO.purchaseMethod;
    this.purchaseWayList = [];
    this.selectedPurchaseWay = null;
    if (purchaseMethod === ApprovalFormNs.PurchaseWay.Inquiry || purchaseMethod === ApprovalFormNs.PurchaseWay.Compete) {
      this.purchaseWayList = [purchaseMethod - 1];
    }
  }
  /**
   * 提交转换采购方式*/
  public onOkSwitchWay() {
    if (this.selectedPurchaseWay === null) {
      this.messageService.showToastMessage('请选择采购方式', 'warning');
      return;
    }
    this.approvalFormService.switchApprovalRowWay(this.selectedRow.purchaseApproveFullDetailVO.id, this.selectedPurchaseWay)
      .subscribe((resData) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.switchWayModalShow = false;
        this.getDetailInfo();
      });
  }
  public cancelSwitchWay() {
    this.switchWayModalShow = false;
  }
  /**
   * 退回计划行*/
  public backRow() {
    const detailIdList = [];
    const originIdList = [];
    this.tableDataList.forEach((item) => {
      if (item.purchaseApproveFullDetailVO[this.tableConfig.checkRowField]) {
        detailIdList.push(item.purchaseApproveFullDetailVO.id);
        originIdList.push(item.purchaseApproveFullDetailVO.purchasePlanDetailId);
      }
    });
    if (detailIdList.length === 0) {
      this.messageService.showToastMessage('请选择需要退回的行', 'warning');
      return;
    }
    this.messageService.showAlertMessage('', '确定要退回选中的计划行?', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.approvalFormService.backApprovalRow(detailIdList, originIdList).subscribe((resData) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.getDetailInfo();
        });
      });
  }
  /**
   * 行处理*/
  public dealRow(rowData: any) {
    this.dealRowData.rowData = rowData;
    this.dealRowData.purchaseNum = this.dealRowData.rowData.purchaseApproveFullDetailVO.quantity;
    this.dealRowData.remainBackNum = this.dealRowData.purchaseNum;
    this.dealRowData.dealNum = 0;
    this.supplierDataList = this.dealRowData.rowData.priceRecordVOList;
    this.supplierDataList.forEach((item) => {
      item['_ctx'] = item;
      item['_dealNumber'] = 0;
    });
    this.dealRowModalShow = true;
  }
  public cancelDealRow() {
    this.dealRowModalShow = false;
  }
  /**
   * 行处理确定数量*/
  public onOkRowNum() {
    if (!this.dealRowData.rowData) {
      return;
    }
    if (this.dealRowData.dealNum > this.dealRowData.purchaseNum) {
      this.messageService.showToastMessage('处理数量不能大于采购数量', 'warning');
      return;
    }
    if (this.dealRowData.dealNum === 0) {
      this.messageService.showToastMessage('请填写处理数量', 'warning');
      return;
    }
    const dataList: ApprovalFormNs.SplitDetialItem[] = [];
    this.dealRowData.rowData.priceRecordVOList.forEach((item) => {
      if (item._dealNumber === 0) {
        return;
      }
      dataList.push({
        quantity: item._dealNumber,
        priceRecordId: item.id
      });
    });
    this.approvalFormService.splitRowDetail(this.dealRowData.rowData.purchaseApproveFullDetailVO.id, dataList).subscribe((resData) => {
      this.dealRowModalShow = false;
      this.messageService.showToastMessage('操作成功', 'success');
      this.dealRowData = {
        index: null,
        purchaseNum: null,
        dealNum: null,
        remainBackNum: null,
        rowData: null
      };
      this.getDetailInfo();
    });
  }
  /**
   * 确定*/
  public onOkApprovalForm() {
  }
  /**
   * 生成审定表*/
  public createApprovalOk() {
    const list = [];
    for (let i = 0, len = this.tableDataList.length; i < len; i++) {
      if (!this.tableDataList[i]['purchaseApproveFullDetailVO'][this.tableConfig.checkRowField]) {
        continue;
      }
      if (this.tableDataList[i]['purchaseApproveFullDetailVO'].status !== ApprovalFormNs.RowDealStatus.Dealed) {
        this.messageService.showToastMessage('只能选择已处理行', 'warning');
        return;
      }
      list.push(this.tableDataList[i]['purchaseApproveFullDetailVO'].id);
    }
    if (list.length === 0) {
      this.messageService.showToastMessage('请选择已处理的行', 'warning');
      return;
    }
    this.messageService.showAlertMessage('', '确定生成审定表？', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.approvalFormService.createApprovalOkForm(this.formId, list).subscribe((resData) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.router.navigate(['/main/purchase/purchaseConfirmation'], {queryParams: {id: resData.value, toPage: 'editPage'}});
          this.getDetailInfo();
        });
      });
  }
  ngOnInit() {
    this.tableConfig = {
      checkAll: false,
      pageSize: 10,
      pageNum: 0,
      showCheckbox: true,
      showPagination: true,
      checkRowField: '_checked',
      loading: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      xScroll: '1500px',
      headers: [
        {title: '行号', field: 'rowNo', width: 50},
        {title: '状态', field: 'status', width: 100, pipe: 'purchaseRowDealStatus'},
        {title: '使用单位', field: 'orgName', width: 150},
        {title: '采购方式', field: 'purchaseMethod', width: 150, pipe: 'purchaseWay'},
        {title: '物料编码', field: 'materialCode', width: 150},
        {title: '物料描述', field: 'materialDesc', width: 180},
        {title: '单位', field: 'unit', width: 80},
        {title: '数量', field: 'originQuantity', width: 100},
        {title: '供应商', field: 'supplierName', width: 200},
        {title: '匹配数量', field: 'quantity', width: 100},
        {title: '报价(元)', field: 'supplierPrice', width: 100},
      ]
    };
    this.supplierTableConfig = {
      showCheckbox: false,
      showPagination: true,
      loading: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      frontPagination: true,
      pageSize: 10,
      pageNum: 1,
      yScroll: 300,
      headers: [
        {title: '确认数量', tdTemplate: this.numberTpl, width: 100},
        {title: '供应商', field: 'supplierName', width: 150},
        {title: '数量', field: 'supplierCount', width: 80},
        {title: '价格', field: 'supplierPrice', width: 100},
        {title: '规格型号', field: 'supplierModel', width: 100},
        {title: '品牌厂家', field: 'supplierBrand', width: 150},
        {title: '报价备注', field: 'remark', width: 180},
      ]
    };
    this.supplierPriceSumConfig = {
      showCheckbox: false,
      showPagination: true,
      loading: false,
      pageNum: 1,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      frontPagination: true,
      headers: [
        {title: '序号', field: 'index', width: 50},
        {title: '供应商名称', field: 'supplierName', width: 150},
        {title: '报价总计(元)', field: 'totalPrice', width: 100},
        {title: '成交总数量', field: 'biddingCount', width: 150},
        {title: '成交总额(元)', field: 'biddingPrice', width: 150},
      ]
    };
    this.getDetailInfo();
  }
}
