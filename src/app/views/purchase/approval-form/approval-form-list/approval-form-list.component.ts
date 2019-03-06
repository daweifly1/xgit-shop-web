import {Component, OnInit, TemplateRef, ViewChild, OnDestroy} from '@angular/core';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ApprovalFormNs, ApprovalFormService} from '../../../../core/trans/purchase/approval-form.service';
import {ActivatedRoute, Router} from '@angular/router';
import { ActionCode } from '../../../../../environments/actionCode';
import { NegotiationPlanServiceNs } from '../../../../core/trans/negotiation-plan.service';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';
import { NegotiationMinutesServiceNs } from '../../../../core/trans/purchase/negotiation-minutes.service';
import {WorkBoardServiceNs} from '../../../../core/trans/work-board.service';
enum PageType {
  ManagePage,
  DetailPage,
  EditPage,
  DealPricePage,
  InquiryPricePage
}
interface ActionStatus {
  edit: boolean;
  askPrice: boolean;
  viewPrice: boolean;
  approval: boolean;
  dealPrice: boolean;
  approveApplyReturn: boolean;
  cancellation: boolean;  // 作废
  switchPurchaseWay: boolean;
  createPlan: boolean;  // 建谈判预案
  // createSummary: boolean; // 建谈判纪要
}
@Component({
  selector: 'app-approval-form-list',
  templateUrl: './approval-form-list.component.html',
  styleUrls: ['./approval-form-list.component.scss']
})
export class ApprovalFormListComponent implements OnInit, OnDestroy {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('approvalNoTpl') approvalNoTpl: TemplateRef<any>;

  PageTypeEnum = PageType;
  currentPage: PageType;
  actionStatus: {[index: string]: ActionStatus};
  tableConfig: UfastTableNs.TableConfig;
  dataList: ApprovalFormNs.ApprovalFormItem[];
  showAdvancedSearch: boolean;
  filterData: any;
  selectedId: string;
  ActionCode = ActionCode;
  switchWayModalShow: boolean;
  switchApplyReturnShow: boolean;
  selectedPurchaseWay: ApprovalFormNs.PurchaseWay;
  purchaseWayList: ApprovalFormNs.PurchaseWay[];
  // 审批流数据设置
  auditFlowData: WorkBoardServiceNs.AuditFlowData;
  listenRouteHandler: any;
  isAuditPurchaseWay: boolean;
  reason: string;
  auditType: number;
  constructor(private messageService: ShowMessageService, private approvalFormService: ApprovalFormService,
              private utilService: UfastUtilService, private activatedRouter: ActivatedRoute, private router: Router) {
    this.switchWayModalShow = false;
    this.actionStatus = {};
    this.currentPage = this.PageTypeEnum.ManagePage;
    this.dataList = [];
    this.showAdvancedSearch = false;
    this.filterData = {};
    this.auditFlowData = <any>{};
    this.reason = '';
    this.auditType = 0;
  }
  public resetSearch() {
    this.filterData = {};
    this.getDataList();
  }
  public onAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
  public exitChildPage() {
    this.auditFlowData = <any>{};
    this.currentPage = this.PageTypeEnum.ManagePage;
    this.isAuditPurchaseWay = false;
    this.auditType = 0;
    this.getDataList();
  }
  public onSwitchPurchaseWay(id: string, purchaseWay: ApprovalFormNs.PurchaseWay) {
    this.selectedId = id;
    this.selectedPurchaseWay = null;
    this.switchWayModalShow = true;
    if (purchaseWay === ApprovalFormNs.PurchaseWay.Inquiry || purchaseWay === ApprovalFormNs.PurchaseWay.Compete) {
      this.purchaseWayList = [purchaseWay - 1];
    }
  }
  public approveApplyReturn(id: string) {
    this.selectedId = id;
    this.switchApplyReturnShow = true;

  }
  public onOkSwitchWay() {
    if (this.selectedPurchaseWay === null) {
      this.messageService.showToastMessage('请选择采购方式', 'warning');
      return;
    }
    this.approvalFormService.switchApprovalFormWay(this.selectedId, this.selectedPurchaseWay).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.switchWayModalShow = false;
      this.getDataList();
    });
  }
  public onOkSwitchApplyReturn() {
    const param = <any>{};
    param.id = this.selectedId;
    param.returnSeason = this.reason;
    this.approvalFormService.approveApplyReturn(param).subscribe((resData) => {
      this.messageService.showToastMessage('操作成功', 'success');
      this.switchApplyReturnShow = false;
      this.getDataList();
    });
  }
  public cancelSwitchApplyReturn() {
    this.switchApplyReturnShow = false;
  }
  public cancelSwitchWay() {
    this.switchWayModalShow = false;
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public onCancellation(id: string) {
    this.messageService.showAlertMessage('', '确定作废审批表？', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.approvalFormService.cancelApprovalForm(id).subscribe((resData) => {
          this.messageService.showToastMessage('操作成功', 'success');
          this.getDataList();
        });
      });
  }

  public approvalPass(finishHandle) {
    const action = this.getAction(true);
    this.doApproval(action, '确定审核通过？', finishHandle);
  }
  public approvalReject(finishHandle) {
    const action = this.getAction(false);
    this.doApproval(action, '确定审核拒绝？', finishHandle);
  }
  private getAction(isOk: boolean) {
    switch (this.auditType) {
      case ApprovalFormNs.AuditType.AuditChangeMethod:
        return isOk ? ApprovalFormNs.PurchaseMethodChangeStatus.Approved : ApprovalFormNs.ApprovalStatus.ApprovePass;
      case ApprovalFormNs.AuditType.AuditApplyReturn:
        return isOk ? ApprovalFormNs.PurchaseApproveReturnStatus.Approved : ApprovalFormNs.ApprovalStatus.ApprovePass;
      default:
        return isOk ? ApprovalFormNs.ApprovalStatus.ApprovePass : ApprovalFormNs.ApprovalStatus.Refuse;
    }
  }

  private doApproval(action, message: string, finishHandle) {
      let handler;
      switch (this.auditType) {
        case ApprovalFormNs.AuditType.AuditChangeMethod:
          handler = this.approvalFormService.auditChangeMethod(this.selectedId, action);
          break;
        case ApprovalFormNs.AuditType.AuditApplyReturn:
          handler = this.approvalFormService.auditApplyReturnStatus(this.selectedId, action);
          break;
        default:
          handler = this.approvalFormService.modifyApproveStatus(this.selectedId, action);
          break;
      }
      handler.subscribe((resData) => {
        this.messageService.showToastMessage('操作成功', 'success');
        finishHandle();
      });
  }
  getDataList = () => {
    this.filterData.startDate = this.utilService.getStartDate(this.filterData.startDate);
    this.filterData.endDate = this.utilService.getEndDate(this.filterData.endDate);
    const filterData: ApprovalFormNs.FilterData<any> = {
      pageNum: this.tableConfig.pageNum,
      pageSize: this.tableConfig.pageSize,
      filters: this.filterData
    };
    this.approvalFormService.getApprovalFormList(filterData).subscribe((resData: ApprovalFormNs.UfastHttpResT<any>) => {
      this.dataList = resData.value.list;
      this.tableConfig.total = resData.value.total;
      this.actionStatus = {};
      this.dataList.forEach((item) => {
        this.actionStatus[item.id] = {
          edit: item.status === ApprovalFormNs.ApprovalStatus.Init || item.status === ApprovalFormNs.ApprovalStatus.Refuse,
          askPrice: item.status === ApprovalFormNs.ApprovalStatus.ApprovePass &&
                    item.purchaseMethod !== ApprovalFormNs.PurchaseWay.InviteTender &&
                    item.purchaseMethod !== ApprovalFormNs.PurchaseWay.OpenTender &&
                    item.changeMethodStatus !== ApprovalFormNs.PurchaseMethodChangeStatus.WaitApprove &&
                    item.returnStatus !== ApprovalFormNs.PurchaseApproveReturnStatus.WaitApprove,
          viewPrice: item.purchaseMethod === ApprovalFormNs.PurchaseWay.OpenTender ||
                    item.purchaseMethod === ApprovalFormNs.PurchaseWay.InviteTender,
          approval: item.changeMethodStatus === ApprovalFormNs.PurchaseMethodChangeStatus.WaitApprove ||
                    item.returnStatus === ApprovalFormNs.PurchaseApproveReturnStatus.WaitApprove,
          dealPrice: item.status === ApprovalFormNs.ApprovalStatus.WaitDealPrice ||
                    item.status === ApprovalFormNs.ApprovalStatus.PartConfirm,
          cancellation: (item.status !== ApprovalFormNs.ApprovalStatus.Cancel)
          && (item.status !== ApprovalFormNs.ApprovalStatus.WaitApprove)
           && (item.status !== ApprovalFormNs.ApprovalStatus.Complete),  // 作废
          approveApplyReturn: item.status === ApprovalFormNs.ApprovalStatus.ApprovePass &&
                    item.returnStatus !== ApprovalFormNs.PurchaseApproveReturnStatus.WaitApprove &&
                    item.changeMethodStatus !== ApprovalFormNs.PurchaseMethodChangeStatus.WaitApprove,
          switchPurchaseWay: (item.purchaseMethod === ApprovalFormNs.PurchaseWay.Inquiry ||
                              item.purchaseMethod === ApprovalFormNs.PurchaseWay.Compete) &&
                              item.status === ApprovalFormNs.ApprovalStatus.ApprovePass  &&
                              item.changeMethodStatus !== ApprovalFormNs.PurchaseMethodChangeStatus.WaitApprove &&
                              item.returnStatus !== ApprovalFormNs.PurchaseApproveReturnStatus.WaitApprove,
          createPlan: item.status !== ApprovalFormNs.ApprovalStatus.Cancel &&
           (item.purchaseMethod === ApprovalFormNs.PurchaseWay.SingleSource ||
           item.purchaseMethod === ApprovalFormNs.PurchaseWay.Compete),  // 建谈判预案
        };
      });
    });
  }
  disabledStart = (startDate: Date) => {
    if (!startDate || !this.filterData.endDate) {
      return false;
    }
    return startDate.getTime() > this.filterData.endDate.getTime();
  }
  disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filterData.startDate) {
      return false;
    }
    return endDate.getTime() <= this.filterData.startDate.getTime();
  }
  goChildPage(id: string, pageType: number, changeMethodStatus?: number, returnStatus?: number) {
    this.selectedId = id;
    this.currentPage = pageType;
     if (changeMethodStatus === ApprovalFormNs.PurchaseMethodChangeStatus.WaitApprove) {
       this.auditType = ApprovalFormNs.AuditType.AuditChangeMethod;
    } else if (returnStatus === ApprovalFormNs.PurchaseApproveReturnStatus.WaitApprove) {
       this.auditType = ApprovalFormNs.AuditType.AuditApplyReturn;
     } else {
       this.auditType = ApprovalFormNs.AuditType.AuditDefault;
     }

    this.isAuditPurchaseWay = changeMethodStatus === ApprovalFormNs.PurchaseMethodChangeStatus.WaitApprove;
  }
  public goAskPrice(id: string) {
    this.selectedId = id;
    this.currentPage = PageType.InquiryPricePage;
  }
  public addNegotiationPlan(approvalNo) {
    this.router.navigate(['/main/purchase/approvalForm/negotiationPlan'], {queryParams: {
      approvalNo: approvalNo,
      pageType: NegotiationPlanServiceNs.NegotiationPlanPageType.AddPage
    }});
  }
  public addNegotiationMinutes(approvalNo: string, id: string) {
    this.router.navigate(['/main/purchase/approvalForm/negotiationMinutes'], {
      queryParams: {
        approvalNo: approvalNo,
        pageType: NegotiationMinutesServiceNs.NegotiationMinutesPageType.AddPage
      }
    });
  }
  public createPrice(id) {
    this.approvalFormService.createPriceTest(id).subscribe((resData) => {
      this.messageService.showToastMessage('生成报价成功', 'success');
    });
  }
  /**
   * 监听路由参数， 获取审批流参数*/
  private listenRouteParams() {
    this.listenRouteHandler = this.activatedRouter.queryParams.subscribe((data: any) => {
      if (!data || data['isAuditFlow'] !== WorkBoardServiceNs.AuditFlowRouteParam.IsAuditFlow) {
        return;
      }
      this.auditFlowData = Object.assign({}, data);
      if (!data.billId) {
        this.messageService.showToastMessage('无效单据号', 'error');
        return;
      }
      this.selectedId = this.auditFlowData.billId;
      this.currentPage = PageType.DetailPage;
    });
  }
  ngOnInit() {
    this.tableConfig = {
      id: 'purchase-approvalFormList',
      pageNum: 1,
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 220, fixed: true},
        {title: '审批表编号', tdTemplate: this.approvalNoTpl, width: 150},
        {title: '状态', field: 'status', width: 120, pipe: 'purchaseApprovalStatus'},
        {title: '采购方式', field: 'purchaseMethod', width: 120, pipe: 'purchaseWay'},
        {title: '采购方式变更状态', field: 'changeMethodStatus', width: 120, pipe: 'purchaseMethodChangeStatus'},
        {title: '申请退回状态', field: 'returnStatus', width: 120, pipe: 'purchaseApproveApplyReturnStatus'},
        {title: '采购模式', field: 'purchaseType', width: 120, pipe: 'purchaseMode'},
        // {title: '物料类型', field: '', width: 120, pipe: 'materialType2'},
        {title: '采购物料说明', field: 'remark', width: 180},
        {title: '创建人', field: 'creatorName', width: 120},
        {title: '创建时间', field: 'createDate', width: 150, pipe: 'date:yyyy-MM-dd HH:mm:ss'},
      ]
    };
    this.getDataList();
    // 监听路由参数， 获取审批流参数
    this.listenRouteParams();
  }
  ngOnDestroy() {
    if (this.listenRouteHandler) {
      this.listenRouteHandler.unsubscribe();
    }
  }
}
