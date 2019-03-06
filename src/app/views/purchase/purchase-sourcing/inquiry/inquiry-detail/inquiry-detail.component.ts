import { ActionCode } from './../../../../../../environments/actionCode';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {SourcingInquiryNs, SourcingInquiryService} from '../../../../../core/trans/purchase/sourcing-inquiry.service';
import {ApprovalFormNs, ApprovalFormService} from '../../../../../core/trans/purchase/approval-form.service';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
import {InquiryPageType} from '../inquiry.component';
import {SourcingQuotationServiceNs} from '../../../../../core/trans/purchase/sourcing-quotation.service';
import {UfastFormDetailNs} from '../../../../../layout/ufast-form-detail/ufast-form-detail.component';
interface ActionStatus {
  getQuote: boolean;        // 获取报价
  getQuoteAhead: boolean;   // 提前获取报价
  dealBid: boolean;         // 中标处理
  switchPurchaseWay: boolean;
  cancelApproval: boolean;
}
@Component({
  selector: 'app-inquiry-detail',
  templateUrl: './inquiry-detail.component.html',
  styleUrls: ['./inquiry-detail.component.scss']
})
export class InquiryDetailComponent implements OnInit {
  @Input()id: string;
  @Output()finish: EventEmitter<any>;
  orderInfo: SourcingInquiryNs.InquiryOrderDetail;
  materialRowTableConfig: UfastTableNs.TableConfig;
  supplierTableConfig: UfastTableNs.TableConfig;
  supplierDataList: SourcingInquiryNs.InquirySupplierItem[];
  materialRowDataList: SourcingInquiryNs.InquiryMaterialRowItem[];
  actionStatus: ActionStatus;
  switchWayModalShow: boolean;
  selectedPurchaseWay: number;
  purchaseWayList: number[];
  isAheadGetQuote: boolean;
  ActionCode = ActionCode;
  detailDataConfig: any[];
  constructor(private messageService: ShowMessageService, private inquiryService: SourcingInquiryService,
              private approvalFormService: ApprovalFormService, private utilService: UfastUtilService) {
    this.purchaseWayList = [];
    this.finish = new EventEmitter<any>();
    this.orderInfo = <any>{};
    this.actionStatus = <any>{};
    this.switchWayModalShow = false;
    this.detailDataConfig = [
      {name: '审批表号', field: 'purchaseApproveNo'},
      {name: '询价单号', field: 'inquiryNo'},
      {name: '标题', field: 'title', isFullSpan: true},
      {name: '询价日期', field: 'inquireDate', pipe: 'date:yyyy-MM-dd'},
      {name: '报价截止时间', field: 'quoteEndDate', pipe: 'date:yyyy-MM-dd'},
      {name: '发件人', field: 'inquireUserName'},
      {name: '联系电话', field: 'inquireUserPhone'},
      {name: '接收报价地址', field: 'receiveQuoteAddress'},
      {name: '发件人部门', field: 'inquireUserDept'},
      {name: '询价方式', field: 'inquiryMethod', pipe: 'inquiryMethod'},
      {name: '传真', field: 'receiveQuoteFax'},
      {name: '付款方式', field: 'payMethod'},
      {name: '询价状态', field: 'status', pipe: 'purchaseInquiryStatus'},
    ];
  }
  public trackByItem(index, item) {
    return item;
  }
  private getInquiryDetail() {
    this.inquiryService.getInquiryDetail(this.id).subscribe((resData) => {
      this.orderInfo = resData.value;
      this.supplierDataList = this.orderInfo.supplierVOS;
      this.materialRowDataList = this.orderInfo.detailVOS;
      this.isAheadGetQuote = this.utilService.getStartDate(this.orderInfo.quoteEndDate).getTime() >= new Date().getTime();
      this.actionStatus.getQuote = this.orderInfo.status === SourcingInquiryNs.InquiryStatus.WaitQuote;
      this.actionStatus.getQuoteAhead = !this.supplierDataList.find(item => item.accpetAdvance === 0 &&
        item.status !== SourcingQuotationServiceNs.QuotationStatus.Cancel) && this.actionStatus.getQuote;
      this.actionStatus.dealBid = this.orderInfo.status === SourcingInquiryNs.InquiryStatus.End;

      const approvalStatus = this.orderInfo.approveVO.status;
      const purchaseMethod = this.orderInfo.approveVO.purchaseMethod;
      this.actionStatus.switchPurchaseWay = (purchaseMethod === ApprovalFormNs.PurchaseWay.Inquiry ||
          purchaseMethod === ApprovalFormNs.PurchaseWay.Compete) &&
        (approvalStatus < ApprovalFormNs.ApprovalStatus.ApprovePass ||
          approvalStatus === ApprovalFormNs.ApprovalStatus.Refuse ||
          approvalStatus === ApprovalFormNs.ApprovalStatus.WaitPrice);
    });
  }
  public onDealBid() {
    this.finish.emit(InquiryPageType.DealBidPage);
  }
  public onGetQuote() {
    this.messageService.showAlertMessage('', '确定获取报价?', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.inquiryService.getQuote(this.orderInfo.id).subscribe((resData) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.getInquiryDetail();
        });
      });
  }
  public returnMainPage() {
    this.finish.emit();
  }
  public cancelApprovalForm() {
    this.messageService.showAlertMessage('', '确定作废审批表?', 'confirm').afterClose
      .subscribe((type) => {
        if (type !== 'onOk') {
          return;
        }
        this.approvalFormService.cancelApprovalForm(this.orderInfo.purchaseApproveId).subscribe((resData) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.getInquiryDetail();
        });
      });
  }
  public onSwitchPurchaseWay() {
    this.selectedPurchaseWay = null;
    this.switchWayModalShow = true;
    this.purchaseWayList = [this.orderInfo.approveVO.purchaseMethod - 1];
  }
  public cancelSwitchWay() {
    this.switchWayModalShow = false;
  }
  public onOkSwitchWay() {
    if (this.selectedPurchaseWay === null) {
      this.messageService.showToastMessage('请选择采购方式', 'warning');
      return;
    }
    this.approvalFormService.switchApprovalFormWay(this.orderInfo.purchaseApproveId, this.selectedPurchaseWay).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.switchWayModalShow = false;
      this.getInquiryDetail();
    });
  }
  ngOnInit() {
    this.materialRowTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '行号', field: 'indexNo', width: 80},
        {title: '物料编码', field: 'materialNo', width: 150},
        {title: '物料名称', field: 'materialName', width: 180},
        {title: '属性描述', field: 'materialDesc', width: 180},
        {title: '技术参数', field: 'technicalParameters', width: 120},
        {title: '单位', field: 'unit', width: 80},
        {title: '数量', field: 'quantity', width: 100},
        {title: '需求时间', field: 'needDate', width: 120, pipe: 'date:yyyy-MM-dd'},
        {title: '使用单位', field: 'useOrgName', width: 140},
        {title: '运输方式', field: 'transportMethod', width: 140},
        {title: '品牌/厂家', field: 'brand', width: 140},
        {title: '备注', field: 'remark', width: 180}
      ]
    };
    this.supplierTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '供应商编码', field: 'supplierNo', width: 100},
        {title: '供应商名称', field: 'supplierName', width: 170},
        {title: '联系方式', field: 'supplierContactPhone', width: 100},
        {title: '是否接受提前报价', field: 'accpetAdvance', width: 130, pipe: 'yesOrNo'},
        {title: '报价状态', field: 'status', width: 100, pipe: 'purchaseQuotationStatus'},
      ]
    };
    this.getInquiryDetail();
  }

}
