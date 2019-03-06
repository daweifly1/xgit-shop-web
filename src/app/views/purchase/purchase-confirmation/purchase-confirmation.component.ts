
import {Component, OnDestroy, OnInit, TemplateRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import {PurchaseConfirmationService, PurchaseConfirmationServiceNS} from '../../../core/trans/purchase-confirmation.service';
import {UfastTableNs} from '../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../widget/show-message/show-message';
import {UfastUtilService} from '../../../core/infra/ufast-util.service';
import {ActionCode} from '../../../../environments/actionCode';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import { Router } from '@angular/router';
import { NegotiationMinutesServiceNs, NegotiationMinutesService } from '../../../core/trans/purchase/negotiation-minutes.service';
import {OperationType} from './detail-confirmation/detail-confirmation.component';
import {WorkBoardServiceNs} from '../../../core/trans/work-board.service';

export interface TabPageType {
  mainPage: number;
  detailPage: number;
  editPage: number;
  auditPage: number;
}
export interface ActionStatus {
  edit: boolean;
  audit: boolean;
  delete: boolean;
  createSummary: boolean;
  applyBack: boolean;
  auditBack: boolean;
}

@Component({
  selector: 'app-purchase-confirmation',
  templateUrl: './purchase-confirmation.component.html',
  styleUrls: ['./purchase-confirmation.component.scss']
})
export class PurchaseConfirmationComponent implements OnInit, OnDestroy {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  @ViewChild('downloadTpl') downloadTpl: TemplateRef<any>;
  @ViewChild('summaryTpl') summaryTpl: TemplateRef<any>;
  public selectedPage = 0;
  public tabPageType: TabPageType = {
    mainPage: 0,
    detailPage: 1,
    editPage: 2,
    auditPage: 3
  };
  public confirmationList: PurchaseConfirmationServiceNS.ConfirmationListData[] = [];
  public confirmationTableConfig: UfastTableNs.TableConfig;
  public filters: any = {};
  public isShowAdvancedSearch = false;
  public currConfirmationId = '';
  public actionStatus: {[id: string]: ActionStatus} = {};
  public ActionCode = ActionCode;
  public downloadUrl = environment.otherData.fileServiceUrl;
  public routeQuery: any = null;
  isNewOrder: boolean;
  auditOpType: OperationType;
  isReturnPass: boolean;
  // 审批流数据设置
  auditFlowData: WorkBoardServiceNs.AuditFlowData;
  listenRouteHandler: any;
  returnModalShow: boolean;
  returnData: any;
  constructor(private confirmationService: PurchaseConfirmationService,
              private messageService: ShowMessageService,
              private ufastService: UfastUtilService,
              private route: ActivatedRoute,
              private router: Router,
              private negotiationMinutesService: NegotiationMinutesService) {
                this.returnData = {};
               }

  public getConfirmationList = () => {
    this.filters['startCreateDate'] = this.ufastService.getStartDate(this.filters['startCreateDate']);
    this.filters['endCreateDate'] = this.ufastService.getEndDate(this.filters['endCreateDate']);
    Object.keys(this.filters).forEach((key) => {
      if (!this.filters[key]) {
        return;
      }
      this.filters[key] = this.filters[key].trim();
    });
    const paramsData = {
      pageSize: this.confirmationTableConfig.pageSize,
      pageNum: this.confirmationTableConfig.pageNum,
      filters: this.filters
    };
    this.confirmationService.getConfirmationList(paramsData).subscribe((resData) => {
      this.confirmationTableConfig.loading = false;
      this.confirmationList = [];
      this.confirmationTableConfig.total = resData.value.total || 0;
      this.confirmationList = resData.value.list;
      resData.value.list.forEach((item) => {
        this.actionStatus[item.id] = {
          edit: (item['status'] === PurchaseConfirmationServiceNS.ConfirmationStatus.WaitingSubmit ||
                item['status'] === PurchaseConfirmationServiceNS.ConfirmationStatus.RefuseAudit) &&
                item['status'] !== PurchaseConfirmationServiceNS.ConfirmationStatus.Invalid,
          audit: item['status'] === PurchaseConfirmationServiceNS.ConfirmationStatus.WaitingAudit,
          delete: (item['status'] === PurchaseConfirmationServiceNS.ConfirmationStatus.WaitingSubmit ||
                  item['status'] === PurchaseConfirmationServiceNS.ConfirmationStatus.RefuseAudit) &&
                  item['status'] !== PurchaseConfirmationServiceNS.ConfirmationStatus.Invalid,
          applyBack: item['status'] === PurchaseConfirmationServiceNS.ConfirmationStatus.AgreeAudit &&
                    item['status'] !== PurchaseConfirmationServiceNS.ConfirmationStatus.Invalid &&
                    item['returnStatus'] !== PurchaseConfirmationServiceNS.ConfirmationAuditStatus.Auditing,
          auditBack: item['returnStatus'] === PurchaseConfirmationServiceNS.ConfirmationAuditStatus.Auditing,
          createSummary:  (item['status'] !== PurchaseConfirmationServiceNS.ConfirmationStatus.Invalid) &&
           (item['returnStatus'] !== PurchaseConfirmationServiceNS.ConfirmationAuditStatus.Auditing)
        };
      });
    });
  }
  public onAdvancedSearch() {
    this.isShowAdvancedSearch = !this.isShowAdvancedSearch;
  }

  public resetSearch() {
    this.filters = {};
    this.getConfirmationList();
  }
  public editConfirmation(id: string, returnStatus: PurchaseConfirmationServiceNS.ConfirmationAuditStatus) {
    this.currConfirmationId = id;
    this.selectedPage = this.tabPageType.editPage;
    this.isReturnPass = returnStatus === PurchaseConfirmationServiceNS.ConfirmationAuditStatus.AuditPass;
  }
  public showConfirmationDetail(id) {
    this.currConfirmationId = id;
    this.selectedPage = this.tabPageType.detailPage;
    this.auditOpType = OperationType.None;
  }
  public deleteConfirmation(id) {
    this.messageService.showAlertMessage('', '确定作废该审定表', 'confirm').afterClose.subscribe((type) => {
      if (type !== 'onOk') {
        return;
      }
      this.confirmationService.cancelAllConfirmtion(id).subscribe((resData) => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.getConfirmationList();
      });
    });
  }
  public onApplyBack(id: string) {
    this.returnData.id = id;
    this.returnModalShow = true;
    // this.messageService.showAlertMessage('', '确定申请退回该审定表', 'confirm').afterClose.subscribe((type) => {
    //   if (type !== 'onOk') {
    //     return;
    //   }
    //   this.confirmationService.applyReturn(id).subscribe((resData) => {
    //     this.messageService.showToastMessage('操作成功', 'success');
    //     this.getConfirmationList();
    //   });
    // });
  }
  public cancelReturnModal() {
    this.returnModalShow = false;
    this.returnData = {};
  }
  public confirmReturnModal() {
    if (!this.returnData.returnReason) {
      this.messageService.showToastMessage('退回原因必填', 'warning');
      return;
    }
    this.confirmationService.applyReturn(this.returnData).subscribe((resData) => {
      this.returnModalShow = false;
      this.returnData = {};
      this.messageService.showToastMessage('操作成功', 'success');
      this.getConfirmationList();
    });

  }
  public onAuditBack(id: string) {
    this.currConfirmationId = id;
    this.selectedPage = this.tabPageType.auditPage;
    this.auditOpType = OperationType.ReturnAudit;
  }
  public addNegotiationMinutes(confirmNo: string, id: string ) {
    this.negotiationMinutesService.getSupplierOffer(confirmNo).subscribe((resData: NegotiationMinutesServiceNs.UfastHttpResT<any>) => {
      this.router.navigate(['/main/purchase/approvalForm/negotiationMinutes'], {
        queryParams: {
          confirmNo: confirmNo,
          pageType: NegotiationMinutesServiceNs.NegotiationMinutesPageType.AddPage
        }
      });
    });
  }
  public onChildEmit(refresh) {
    this.isNewOrder = false;
    this.selectedPage = this.tabPageType.mainPage;
    this.auditFlowData = <any>{};
    if (!refresh) {
      return;
    }
    this.getConfirmationList();
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  public disabledEndDate = (endDate) => {
    if (!this.filters.createDateStart) {
      return false;
    }
    return endDate.getTime() < this.filters.createDateStart.getTime();
  }
  public disabledStartDate = (startDate) => {
    if (!this.filters.createDateEnd) {
      return false;
    }
    return startDate.getTime() > this.filters.createDateEnd.getTime();
  }
  ngOnDestroy() {
    if (this.routeQuery) {
      this.routeQuery.unsubscribe();
      this.routeQuery = null;
    }
    if (this.listenRouteHandler) {
      this.listenRouteHandler.unsubscribe();
    }
  }
  /**
   * 监听路由参数， 获取审批流参数*/
  private listenRouteParams() {
    this.listenRouteHandler = this.route.queryParams.subscribe((data: any) => {
      if (!data || data['isAuditFlow'] !== WorkBoardServiceNs.AuditFlowRouteParam.IsAuditFlow) {
        return;
      }
      this.auditFlowData = Object.assign({}, data);
      if (!data.billId) {
        this.messageService.showToastMessage('无效单据号', 'error');
        return;
      }
      this.currConfirmationId = this.auditFlowData.billId;
      this.selectedPage = this.tabPageType.detailPage;
      this.auditOpType = OperationType.None;
    });
  }
  ngOnInit() {
    this.confirmationTableConfig = {
      id: 'purchase-confirmation',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, width: 220, fixed: true},
        {title: '审定表编号', tdTemplate: this.showDetailTpl, width: 150, fixed: true},
        {title: '审批表编号', field: 'purchaseApproveNo', width: 150},
        // {title: this.confirmationDataMap.purchaseSummary.label, tdTemplate: this.summaryTpl, width: 120},
        {title: '状态', field: 'status', pipe: 'purchaseConfirmationStatus', width: 120},
        {title: '申请退回状态', field: 'returnStatus', pipe: 'purchaseConfirmationBackStatus', width: 120},
        {title: '付款性质', field: 'payNature', width: 100},
        {title: '合同金额', field: 'totalAmount', width: 100},
        {title: '合同版本', field: 'contractVersion', width: 100},
        {title: '创建人', field: 'createName', width: 100},
        {title: '创建时间', field: 'createDate', pipe: 'date: yyyy-MM-dd', width: 100},
        {title: '附件', tdTemplate: this.downloadTpl, width: 100},
        {title: '年度协议/合同号', field: 'contractOrAgreementNo', width: 140},
      ]
    };
    this.routeQuery = this.route.queryParams.subscribe((params) => {
      const page = params ? params.toPage : '';
      if (!page) {
        this.getConfirmationList();
        return;
      }
      this.currConfirmationId = params.id || '';
      this.selectedPage = this.tabPageType[page];
      this.isNewOrder = true;
    });
    this.listenRouteParams();
  }

}
