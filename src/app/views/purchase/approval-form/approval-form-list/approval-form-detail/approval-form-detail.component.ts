import {Component, OnInit, Output, EventEmitter, Input, TemplateRef} from '@angular/core';
import {ApprovalFormNs, ApprovalFormService} from '../../../../../core/trans/purchase/approval-form.service';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {PurchaseStepsNs} from '../../../common-component/purchase-steps/purchase-steps.component';
import {WorkBoardService, WorkBoardServiceNs} from '../../../../../core/trans/work-board.service';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Router} from '@angular/router';
import {purchaseWay as PurchanseWay} from '../../../../../../environments/map-data';
@Component({
  selector: 'app-approval-form-detail',
  templateUrl: './approval-form-detail.component.html',
  styleUrls: ['./approval-form-detail.component.scss']
})
export class ApprovalFormDetailComponent implements OnInit {
  @Output()finish: EventEmitter<any>;
  @Input()
   set formId(value: string) {
      this._formId = value;
      this.getDetailInfo();
    }
  @Input()operationTpl: TemplateRef<any>;
  /**
   * 审批流数据变化监听*/
  @Input()
  set auditFlowData(value: WorkBoardServiceNs.AuditFlowData) {
    this._auditFlowData = value;
    this.isAuditFlowPage = false;
    if (this._auditFlowData && this._auditFlowData.isAuditFlow === WorkBoardServiceNs.AuditFlowRouteParam.IsAuditFlow) {
      this.isAuditFlowPage = true;
    }
    this.showAuditFlowBtu = this._auditFlowData && this._auditFlowData['isAudit'] === WorkBoardServiceNs.AuditFlowRouteParam.Audit;
    if (this.showAuditFlowBtu) {
      this.workBoardService.getApproveInfo(this._auditFlowData['processInstanceId']).subscribe((resData: any) => {
        this.approveInfo = resData.value;
      });
    }
  }
  _formId: string;
  supplierList: any[];
  purchaseRowList: any[];
  purchaseInfo: any;
  fieldList: {field: string; name: string; pipe?: string}[];
  supplierTableConfig: UfastTableNs.TableConfig;
  purchasePlanTableConfig:  UfastTableNs.TableConfig;
  detailCtx: any;
  purchaseSteps: PurchaseStepsNs.PurchaseStep = {
    mainStep: PurchaseStepsNs.steps.approveForm,
    subStep: PurchaseStepsNs.subSteps.editApproveForm
  };
  isShowAuditProcess = false;
  supplierTableList: any[];
  supplierTableRightField: string;

  _auditFlowData: WorkBoardServiceNs.AuditFlowData; // 审批流数据
  showAuditFlowBtu: boolean;                      // 审批流按钮显示控制
  approveInfo: WorkBoardServiceNs.ApproveInfo;    // 审批信息
  auditSubmitData: WorkBoardServiceNs.AuditData;  // 审批流提交数据
  auditModalShow: boolean;    // 审批确认框
  isAuditFlowPage: boolean;   // 是否由审批流跳转
  constructor(private approvalFormService: ApprovalFormService, private messageService: ShowMessageService,
              private workBoardService: WorkBoardService, private router: Router, private activatedRouter: ActivatedRoute) {
    this.auditSubmitData = <any>{};
    this.isAuditFlowPage = true;
    this.auditModalShow = false;
    this.showAuditFlowBtu = false;

    this.supplierTableList = [];
    this.supplierTableRightField = '_right';
    this.finish = new EventEmitter<any>();
    this.purchaseInfo = {};
    this.supplierList = [];
    this.purchaseRowList = [];
    this.detailCtx = {
      finishHandle: this.exitPage,
      orderInfo: {}
    };
    this.fieldList = [
      { name: '审批表编号', field: 'approveNo'},
      { name: '采购模式', field: 'purchaseType', pipe: 'purchaseMode'},
      { name: '采购方式', field: 'purchaseMethodDesc'},
      { name: '价格类型', field: 'priceType', pipe: 'purchasePriceType'},
      { name: '金额合计(元)', field: 'totalPrice'},
      { name: '业务类型', field: 'businessType', pipe: 'purchaseContractBusiness'},
      { name: '创建人', field: 'creatorName'},
      { name: '创建时间', field: 'createDate', pipe: 'date:yyyy-MM-dd HH:mm:ss'},
      { name: '供应商管理科审批人', field: 'flowSupplierName'},
      { name: '采购管理科审批人', field: 'flowPurchaserName'},
      // { name: '状态', field: 'status', pipe: 'purchaseApprovalStatus'},
      // { name: '成交策略', field: 'strategy', pipe: 'purchaseDealStrategy'},
    ];
  }
  private getDetailInfo() {
    this.approvalFormService.getApprovalFormDetail(this._formId).subscribe((resData: ApprovalFormNs.UfastHttpResT<any>) => {
      this.purchaseInfo = resData.value || {};
      if (this.purchaseInfo.changeMethodStatus === ApprovalFormNs.PurchaseMethodChangeStatus.WaitApprove) {
        this.purchaseInfo.purchaseMethodDesc =
          `${PurchanseWay[this.purchaseInfo.purchaseMethod]} → ${PurchanseWay[this.purchaseInfo.purchaseMethod - 1]}`;
      } else {
        this.purchaseInfo.purchaseMethodDesc = PurchanseWay[this.purchaseInfo.purchaseMethod];
      }
      this.purchaseRowList = resData.value.purchaseApproveFullDetailVOList;

      this.supplierList = resData.value.purchaseApproveSupplierVOList;
      this.supplierTableList = [];
      this.supplierList.forEach((item, index) => {
        this.resetSupplierTable(item, index);
      });
      this.detailCtx.orderInfo['approveNo'] = this.purchaseInfo.approveNo;
      this.detailCtx.orderInfo['purchaseWay'] = this.purchaseInfo.purchaseMethod;
      this.getPurchaseSteps();
    });
  }
  private getPurchaseSteps() {
    if (this.purchaseInfo.status === ApprovalFormNs.ApprovalStatus.WaitApprove) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.auditApproveForm;
    }
    if (this.purchaseInfo.status === ApprovalFormNs.ApprovalStatus.Init) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.editApproveForm;
    }
    if (this.purchaseInfo.status === ApprovalFormNs.ApprovalStatus.ApprovePass) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.completeApproveForm;
    }
  }
  public trackByItem(index: number, item: any) {
    return item;
  }
  exitPage = () => {
    if (this.isAuditFlowPage) {
      this.exitFlowPage();
    } else {
      this.finish.emit();
    }
  }
  public showAuditProcess() {
    this.isShowAuditProcess = true;
  }
  private resetSupplierTable(supplier: any, index: number) {
    if (index % 2 === 0) {
      this.supplierTableList.push(supplier);
    } else {
      Object.keys(supplier).forEach((key: string) => {
        this.supplierTableList[(index - 1) / 2][key + this.supplierTableRightField] = supplier[key];
      });
    }
  }

  public auditAgree() {
    this.auditSubmitData = {
      comments: '',
      params: {direction: WorkBoardServiceNs.AuditDirection.Agree, amount: this.purchaseInfo.totalPrice},
      toCompleteTasks: [{taskId: this._auditFlowData['taskId'], processInstanceId: this._auditFlowData['processInstanceId']}]
    };
    this.auditModalShow = true;
  }
  public auditReject() {
    this.auditSubmitData = {
      comments: '',
      params: {direction: WorkBoardServiceNs.AuditDirection.Reject, amount: this.purchaseInfo.totalPrice},
      toCompleteTasks: [{taskId: this._auditFlowData['taskId'], processInstanceId: this._auditFlowData['processInstanceId']}]
    };
    this.auditModalShow = true;
  }
  public cancelAuditModal() {
    this.auditModalShow = false;
  }
  public confirmAuditModal() {
    this.auditModalShow = false;
    let conditionHandler = Observable.of('');
    if (this.auditSubmitData.params.direction === WorkBoardServiceNs.AuditDirection.Reject) {
      conditionHandler = this.approvalFormService.modifyApproveStatus(this._auditFlowData.billId,  ApprovalFormNs.ApprovalStatus.Refuse);
    }
    if (this.auditSubmitData.params.direction === WorkBoardServiceNs.AuditDirection.Agree &&
      this.workBoardService.isNeedPreAgree(this.approveInfo.endConditions, this.purchaseInfo.totalPrice)) {
      conditionHandler =
        this.approvalFormService.modifyApproveStatus(this._auditFlowData.billId, ApprovalFormNs.ApprovalStatus.ApprovePass);
    }
    conditionHandler.subscribe(() => {
      this.workBoardService.auditOrder(this.auditSubmitData).subscribe(() => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.exitFlowPage();
      });
    });
  }
  private exitFlowPage() {
    this.finish.emit();
    this.router.navigate([], {relativeTo: this.activatedRouter}).then(() => {
      this.finish.emit();
      this.router.navigateByUrl('/main/workBoard');
      // this.finish.emit();
    });
  }
  ngOnInit() {
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
        {title: '行号', field: 'rowNo', width: 40},
        {title: '供应商编码', field: 'supplierId', width: 100},
        {title: '供应商名称', field: 'supplierName', width: 170},

        {title: '行号', field: 'rowNo' + this.supplierTableRightField, width: 40},
        {title: '供应商编码', field: 'supplierId' + this.supplierTableRightField, width: 100},
        {title: '供应商名称', field: 'supplierName' + this.supplierTableRightField, width: 170},
      ]
    };
    this.purchasePlanTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '行号', field: 'rowNo', width: 60, fixed: true},
        {title: '采购计划编号', field: 'purchasePlanNo', width: 170},
        {title: '业务实体', field: 'orgName', width: 100},
        {title: '采购计划行号', field: 'indexNo', width: 80},
        {title: '物料编码', field: 'materialCode', width: 100},
        {title: '物料名称', field: 'materialName', width: 140},
        {title: '属性描述', field: 'materialDesc', width: 140},
        {title: '单位', field: 'unit', width: 100},
        {title: '采购数量', field: 'quantity', width: 100},
        {title: '采购含税价(元)', field: 'unitPrice', width: 120},
        {title: '总价(元)', field: 'totalPrice', width: 100},
      ]
    };
  }

}
