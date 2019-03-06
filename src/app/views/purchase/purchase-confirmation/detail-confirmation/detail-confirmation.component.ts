import { ActionCode } from './../../../../../environments/actionCode';
import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {PurchaseConfirmationService, PurchaseConfirmationServiceNS} from '../../../../core/trans/purchase-confirmation.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {environment} from '../../../../../environments/environment';
import {PurchaseStepsNs} from '../../common-component/purchase-steps/purchase-steps.component';
import {WorkBoardService, WorkBoardServiceNs} from '../../../../core/trans/work-board.service';
import {Observable} from 'rxjs/Observable';
import {ApprovalFormNs} from '../../../../core/trans/purchase/approval-form.service';
import {ActivatedRoute, Router} from '@angular/router';

export interface TabPageType {
  detailPage: number;
  contractDetailPage: number;
}
export enum OperationType {
  None,     // 详情页面
  ReturnAudit   // 退回审核
}
interface FieldItem {
  name: string; field?: string; isDownload?: boolean; pipe?: string; isFullSpan?: boolean; classList?: string[]; click?: Function;
}
@Component({
  selector: 'app-detail-confirmation',
  templateUrl: './detail-confirmation.component.html',
  styleUrls: ['./detail-confirmation.component.scss']
})
export class DetailConfirmationComponent implements OnInit {
  @Input() set confirmationId(value: string) {
    this._confirmationId = value;
    this.getConfirmationDetail();
  }
  @Input() operation: OperationType;
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
  @Output() backToMainPage: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('contractViewTpl') contractViewTpl: TemplateRef<any>;
  _confirmationId: string;
  public selectedPage = 0;
  public tabPageType: TabPageType = {detailPage: 0, contractDetailPage: 1};
  public confirmationDataMap = PurchaseConfirmationServiceNS.confirmationDataMap;
  public confirmationDetail: PurchaseConfirmationServiceNS.ConfirmationDetailData = {
    confirmationCode: '',
    approveCode: '',
    attachment: '',
    attachmentUrl: '',
    contractVersion: '',
    totalAmount: null,
    contractOrAgreementNo: '',
    payNature: '',
    purchaseSummary: '',
    purchaseWay: '',
    clauseItem: '',
    clauseTitle: '',
    creator: '',
    createDate: '',
    status: null,
    processId: null,
    flowPurchaserName: ''
  };
  public detailDataConfig: FieldItem[] = [];
  public materialLineList: PurchaseConfirmationServiceNS.MaterialLineData[] = [];
  public materialTableConfig: UfastTableNs.TableConfig;
  public contractList: PurchaseConfirmationServiceNS.ContractData[] = [];
  public contractTableConfig: UfastTableNs.TableConfig;
  public downloadUrl = environment.otherData.fileServiceUrl;
  public purchaseWay = {
    isAgreement: false,
    isBuyAgain: false,
  };
  private isDeviceType = false;
  public isAuditPage = false;
  public currContractId = '';
  public isShowRefuseModal = false;
  public refuseReason = '';
  public tabIndex = 0;
  public purchaseSteps: PurchaseStepsNs.PurchaseStep = {
    mainStep: PurchaseStepsNs.steps.confirmation,
    subStep: PurchaseStepsNs.subSteps.editConfirmation
  };
  ActionCode = ActionCode;
  materialTableXScroll: number;
  isShowAuditProcess: boolean;

  _auditFlowData: WorkBoardServiceNs.AuditFlowData; // 审批流数据
  showAuditFlowBtu: boolean;                      // 审批流按钮显示控制
  approveInfo: WorkBoardServiceNs.ApproveInfo;    // 审批信息
  auditSubmitData: WorkBoardServiceNs.AuditData;  // 审批流提交数据
  auditModalShow: boolean;    // 审批确认框
  isAuditFlowPage: boolean;   // 是否由审批流跳转
  constructor(private confirmationService: PurchaseConfirmationService, private workBoardService: WorkBoardService,
              private messageService: ShowMessageService, private router: Router, private activatedRouter: ActivatedRoute) {
    this.auditSubmitData = <any>{};
    this.isAuditFlowPage = false;
    this.auditModalShow = false;
    this.showAuditFlowBtu = false;
  }
  public getConfirmationDetail() {
    this.contractList = [];
    this.confirmationService.getConfirmationDetail(this._confirmationId).subscribe((resData) => {
      Object.keys(this.confirmationDetail).forEach((item) => {
        this.confirmationDetail[item] = resData.value[this.confirmationDataMap[item].key];
      });

      this.purchaseWay.isAgreement = resData.value['purchaseMethod'] ===
        PurchaseConfirmationServiceNS.PurchaseWay.AnualAgreement;
      this.purchaseWay.isBuyAgain = resData.value['purchaseMethod'] ===
        PurchaseConfirmationServiceNS.PurchaseWay.BuyAgain;
      this.getPurchaseSteps();

      this.materialLineList = [];
      let index = 0;
      if (!resData.value.groupVOS || resData.value.groupVOS.length === 0) {
        resData.value.detailVOS.forEach((item) => {
          index++;
          item.indexNo = index;
          this.materialLineList.push(item);
        });
      } else {
        resData.value.groupVOS.forEach((item) => {
          item.detailsVOS.forEach((material) => {
            index++;
            material.indexNo = index;
            this.materialLineList.push(material);
          });
          this.materialLineList.push(<any>{
            materialDesc: '小计',
            contractNo: item.contractNo,
            totalPrice: item.total,
            supplierName: item.detailsVOS[0] ? item.detailsVOS[0].supplierName : ''
          });
        });
      }
      if (this.materialLineList.length === 0) {
        return;
      }
      const priceRecordVOS: any[] = this.materialLineList[0].priceRecordVOS || [];
      this.materialTableXScroll += 200 * priceRecordVOS.length;
      this.isDeviceType = this.materialLineList[0].materialType === PurchaseConfirmationServiceNS.MaterialType.Device ;
      if (!this.isDeviceType) {
        const num = 3;
        for (let i = 0; i < num; i++) {
          this.materialTableXScroll -= this.materialTableConfig.headers[11 + i].width;
        }
        this.materialTableConfig.headers.splice(11, num);
      }
    });
  }
  private getPurchaseSteps() {
    const isInAudit = this.confirmationDetail.status !== PurchaseConfirmationServiceNS.ConfirmationStatus.WaitingSubmit &&
      this.confirmationDetail.status !== PurchaseConfirmationServiceNS.ConfirmationStatus.AgreeAudit;
    if (isInAudit) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.auditConfirmation;
    }
    if (this.confirmationDetail.status === PurchaseConfirmationServiceNS.ConfirmationStatus.WaitingSubmit) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.editConfirmation;
    }
    if (this.confirmationDetail.status === PurchaseConfirmationServiceNS.ConfirmationStatus.AgreeAudit) {
      this.purchaseSteps.subStep = PurchaseStepsNs.subSteps.completeConfirmation;
    }
  }
  public getContractInfo() {
    if (this.contractList.length > 0) {
      return;
    }
    this.confirmationService.getContractInfoByConfirm(this._confirmationId).subscribe((resData) => {
      this.contractList = [];
      resData.value.forEach((item, index) => {
        this.contractList.push({
          id: item[this.confirmationDataMap.id.key],
          seqNo: index + 1,
          lineNo: item[this.confirmationDataMap.lineNo.key],
          contractCode: item[this.confirmationDataMap.contractCode.key],
          orgName: item[this.confirmationDataMap.orgName.key],
          supplier: item[this.confirmationDataMap.supplier.key],
          materialType: item[this.confirmationDataMap.materialType.key],
          tax: item[this.confirmationDataMap.tax.key],
          contractAmount: item[this.confirmationDataMap.contractAmount.key],
          carryingMethod: item[this.confirmationDataMap.carryingMethod.key],
          signDate: item[this.confirmationDataMap.signDate.key]
        });
      });
    });
  }
  public agreeAudit() {
    this.messageService.showAlertMessage('', '确定审核通过？', 'confirm').afterClose.subscribe((type) => {
      if (type !== 'onOk') {
        return;
      }
      this.confirmationService.allowReturn(this._confirmationId).subscribe(resData => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitPage(true);
      });
    });
  }

  public refuseAudit() {
    this.messageService.showAlertMessage('', '确定审核拒绝？', 'confirm').afterClose.subscribe((type) => {
      if (type !== 'onOk') {
        return;
      }
      this.confirmationService.refuseReturn(this._confirmationId).subscribe(resData => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.emitPage(true);
      });
    });
  }
  public viewContract(id) {
    this.currContractId = id;
    this.selectedPage = this.tabPageType.contractDetailPage;
  }
  public onContractEmit() {
    this.selectedPage = this.tabPageType.detailPage;
  }
  public emitPage(refresh) {
    if (this.isAuditFlowPage) {
      this.exitFlowPage(refresh);
    } else {
      this.backToMainPage.emit(refresh);
    }
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  public auditAgreeFlow() {
    this.auditSubmitData = {
      comments: '',
      params: {direction: WorkBoardServiceNs.AuditDirection.Agree, amount: this.confirmationDetail.totalAmount},
      toCompleteTasks: [{taskId: this._auditFlowData['taskId'], processInstanceId: this._auditFlowData['processInstanceId']}]
    };
    this.auditModalShow = true;
  }
  public auditRejectFlow() {
    this.auditSubmitData = {
      comments: '',
      params: {direction: WorkBoardServiceNs.AuditDirection.Reject, amount: this.confirmationDetail.totalAmount},
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
      conditionHandler = this.confirmationService.refuseConfirmationAudit(this._confirmationId);
    }
    if (this.auditSubmitData.params.direction === WorkBoardServiceNs.AuditDirection.Agree &&
      this.workBoardService.isNeedPreAgree(this.approveInfo.endConditions, this.confirmationDetail.totalAmount)) {
      conditionHandler = this.confirmationService.agreeConfirmationAudit(this._confirmationId);
    }
    conditionHandler.subscribe(() => {
      this.workBoardService.auditOrder(this.auditSubmitData).subscribe(() => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.exitFlowPage();
      });
    });
  }
  private exitFlowPage(refresh = true) {
    this.backToMainPage.emit(refresh);
    this.router.navigate([], {relativeTo: this.activatedRouter}).then(() => {
      this.router.navigateByUrl('/main/workBoard');
      // this.backToMainPage.emit(refresh);
    });
  }
  public onItemClick(fun) {
    if (fun) {
      fun();
    }
  }
  onStatusClick = () => {
    this.isShowAuditProcess = !this.isShowAuditProcess;
  }
  ngOnInit() {
    this.materialTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '序号', field: 'indexNo', width: 50},
        {title: '合同编号', field: 'contractNo', width: 150},
        {title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 80},
        {title: '物料编码', field: 'materialNo', width: 160},
        {title: '物料描述', field: 'materialDesc', width: 200},
        {title: '单位', field: 'unit', width: 80},
        {title: '总价', field: 'totalPrice', width: 100},
        {title: '数量', field: 'quantity', width: 100},
        {title: '确定单价', field: 'unitPrice', width: 100},
        {title: '交货日期', field: 'deliveryDate', width: 100, pipe: 'date:yyyy-MM-dd'},
        {title: '币种', field: 'currencyCode', width: 100},
        {title: '税率(%)', field: 'tax', width: 100},
        {title: '供应商', field: 'supplierName', width: 150},
        {title: '生产厂家', field: 'manufactureFactory', width: 150},
        {title: '规格型号', field: 'materialModel', width: 100},
        {title: '设计使用寿命', field: 'lifeTime', width: 110},
        {title: '供应商', field: 'supplierName', width: 150},
        {title: '使用单位', field: 'useOrgName', width: 150}
      ]
    };
    this.materialTableXScroll = 0;
    this.materialTableConfig.headers.forEach((item) => {
      this.materialTableXScroll += item.width;
    });
    this.contractTableConfig = {
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [
        {title: '操作', tdTemplate: this.contractViewTpl, width: 80},
        {title: '序号', field: 'seqNo', width: 50},
        {title: '合同编码', field: 'contractCode', width: 100},
        {title: '业务实体', field: 'orgName', width: 100},
        {title: '供应商', field: 'supplier', width: 150},
        {title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 80},
        {title: '税率(%)', field: 'tax', width: 100},
        {title: '合同总价', field: 'contractAmount', width: 100},
        {title: '结转方式', field: 'carryingMethod', width: 120, pipe: 'contractCarryOverType'},
        {title: '签约时间', field: 'signDate', width: 120, pipe: 'date:yyyy-MM-dd'}
      ]
    };
    this.detailDataConfig = [
      {name: '审定表编号', field: 'confirmationCode'},
      {name: '审批表编号', field: 'approveCode'},
      {name: '附件', field: 'attachmentUrl', isDownload: true},
      {name: '合同版本', field: 'contractVersion'},
      {name: '金额总计(元)', field: 'totalAmount'},
      {name: '付款性质', field: 'payNature'},
      {name: '采购方式', field: 'purchaseWay', pipe: 'purchaseWay'},
      {name: '采购管理科审批人', field: 'flowPurchaserName'},
      {name: '创建人', field: 'creator'},
      {name: '创建日期', field: 'createDate', pipe: 'date: yyyy-MM-dd'},
      {name: '状态', field: 'status', pipe: 'purchaseConfirmationStatus', classList: ['operate-text'], click: this.onStatusClick},
      {name: '条内容', field: 'clauseTitle', isFullSpan: true},
      {name: '款内容', field: 'clauseItem', isFullSpan: true},
      {name: '采购概况说明', field: 'purchaseSummary', isFullSpan: true},
    ];
    this.isAuditPage = this.operation !== OperationType.None;
  }

}
