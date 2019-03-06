import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NegotiationPlanService, NegotiationPlanServiceNs } from '../../../../../core/trans/negotiation-plan.service';
import { ShowMessageService } from '../../../../../widget/show-message/show-message';
import { Observable } from 'rxjs/Observable';
import { WorkBoardService, WorkBoardServiceNs } from '../../../../../core/trans/work-board.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionCode } from '../../../../../../environments/actionCode';
@Component({
  selector: 'app-detail-negotiation-plan',
  templateUrl: './detail-negotiation-plan.component.html',
  styleUrls: ['./detail-negotiation-plan.component.scss']
})
export class DetailNegotiationPlanComponent implements OnInit {
  @Output() finish: EventEmitter<any>;
  @Input()
  set detailId(value: string) {
    this._detailId = value;
    this.getNegotiationPlanDetail();
  }
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
  _auditFlowData: WorkBoardServiceNs.AuditFlowData; // 审批流数据
  showAuditFlowBtu: boolean;                      // 审批流按钮显示控制
  approveInfo: WorkBoardServiceNs.ApproveInfo;    // 审批信息
  auditSubmitData: WorkBoardServiceNs.AuditData;  // 审批流提交数据
  auditModalShow: boolean;    // 审批确认框
  isAuditFlowPage: boolean;   // 是否由审批流跳转
  isShowAuditProcess: boolean;

  negotiationDetail: any;
  _detailId: string;
  ActionCode = ActionCode;
  isAuditReject: boolean;
  constructor(private negotiationPlanService: NegotiationPlanService, private workBoardService: WorkBoardService,
    private messageService: ShowMessageService, private activatedRouter: ActivatedRoute,
    private router: Router) {
    this.finish = new EventEmitter<any>();
    this.negotiationDetail = {};

    this.auditSubmitData = <any>{};
    this.isAuditFlowPage = false;
    this.auditModalShow = false;
    this.showAuditFlowBtu = false;
    this.isAuditReject = false;
  }
  public getNegotiationPlanDetail() {
    this.negotiationPlanService.getNegotiationPlanDetail(this._detailId).subscribe(
      (resData: NegotiationPlanServiceNs.UfastHttpResT<any>) => {
        this.negotiationDetail = resData.value;
      });
  }
  public auditAgree() {
    this.isAuditReject = false;
    this.auditSubmitData = {
      comments: '',
      params: { direction: WorkBoardServiceNs.AuditDirection.Agree, amount: this.negotiationDetail.negotiationAmout },
      toCompleteTasks: [{ taskId: this._auditFlowData['taskId'], processInstanceId: this._auditFlowData['processInstanceId'] }]
    };
    this.auditModalShow = true;
  }
  public auditReject() {
    this.isAuditReject = true;
    this.auditSubmitData = {
      comments: '',
      params: { direction: WorkBoardServiceNs.AuditDirection.Reject, amount: this.negotiationDetail.negotiationAmout },
      toCompleteTasks: [{ taskId: this._auditFlowData['taskId'], processInstanceId: this._auditFlowData['processInstanceId'] }]
    };
    this.auditModalShow = true;
  }
  public cancelAuditModal() {
    this.auditModalShow = false;
  }
  public confirmAuditModal() {
    if (this.isAuditReject && !this.auditSubmitData.comments) {
      this.messageService.showToastMessage('审批意见必填', 'warning');
      return;
    }
    this.auditModalShow = false;
    let conditionHandler: any = Observable.of('');
    if (this.auditSubmitData.params.direction === WorkBoardServiceNs.AuditDirection.Reject) {
      conditionHandler =
        this.negotiationPlanService.audit(this._auditFlowData.billId, NegotiationPlanServiceNs.NegotiationPlanStatus.Reject);
    }
    if (this.auditSubmitData.params.direction === WorkBoardServiceNs.AuditDirection.Agree &&
      this.workBoardService.isNeedPreAgree(this.approveInfo.endConditions, this.negotiationDetail.negotiationAmout)) {
      conditionHandler =
        this.negotiationPlanService.audit(this._auditFlowData.billId, NegotiationPlanServiceNs.NegotiationPlanStatus.Pass);
    }
    conditionHandler.subscribe(() => {
      this.workBoardService.auditOrder(this.auditSubmitData).subscribe(() => {
        this.messageService.showToastMessage('操作成功', 'success');
        this.exitFlowPage();
      });
    });
  }
  private exitFlowPage() {
    this.router.navigate([], { relativeTo: this.activatedRouter }).then(() => {
      this.router.navigateByUrl('/main/workBoard');
      this.finish.emit();
    });
  }
  public onCancel() {
    if (this.isAuditFlowPage) {
      this.exitFlowPage();
    } else {
      this.finish.emit();
    }
  }
  public showAuditProcess() {
    this.isShowAuditProcess = !this.isShowAuditProcess;
  }
  ngOnInit() {
  }

}
