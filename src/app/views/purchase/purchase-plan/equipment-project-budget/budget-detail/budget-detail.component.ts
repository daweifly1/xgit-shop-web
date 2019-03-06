import { ActionCode } from './../../../../../../environments/actionCode';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UfastTableNs} from '../../../../../layout/ufast-table/ufast-table.component';
import {PurchaseService, PurchaseServiceNs} from '../../../../../core/trans/purchase.service';
import {ShowMessageService} from '../../../../../widget/show-message/show-message';
import {UfastUtilService} from '../../../../../core/infra/ufast-util.service';
import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'app-budget-detail',
  templateUrl: './budget-detail.component.html',
  styleUrls: ['./budget-detail.component.scss']
})
export class BudgetDetailComponent implements OnInit {
  @Input()projectId: string|number;
  @Input()operation: string;
  @Output()goBackToMainPage: EventEmitter<any>;
  public textLength = {
    default: 50,
  };
  public budgetDetail: {name: string; field: string; isEdit: boolean; pipe?: string; isFullSpan?: boolean; isNumberInput?: boolean}[] = [];
  public investTableConfig: UfastTableNs.TableConfig;
  public investModifyList: PurchaseServiceNs.InvestModifyData[] = [];
  public budgetItem: PurchaseServiceNs.EquipmentProjectBudgetData = {
    orgName: '',
    orgId: '',
    id: '',
    projectName: '',
    projectCode: '',
    projectTypeId: '',
    projectTypeCode: '',
    projectType: '',
    managerDepartmentId: '',
    managerDepartment: '',
    belongYear: '',
    beginYear: '',
    totalInvest: '',
    availableInvest: '',
    inPlanInvest: '',
    usedInvest: '',
    remark: '',
    seqNo: '',
    status: '',
    quotaStatus: '',
    rejectReason: '',
    modifyReason: ''
  };
  public modifyReason = '';
  public budgetItemMap = this.purchaseService.budgetDataMap;
  public actionsStatus = {
    agreeAudit: false,
    refuseAudit: false,
    completeBudget: false,
    modifyQuota: false
  };
  public isShowRefuseModal = false;
  public refuseReason = '';
  public isShowCompleteModal = false;
  public completeReason = '';
  public isBudgetRefused = false;
  public decimals = {
    precision: environment.otherData.materialNumDec,
    min: environment.otherData.materialNumMin,
    max: environment.otherData.materialNumMax
  };
  ActionCode = ActionCode;
  belongYear: any;
  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService,
              private ufastUtilService: UfastUtilService) {
    this.goBackToMainPage = new EventEmitter<any>();
  }
  public goBack(refresh) {
    this.goBackToMainPage.emit(refresh);
  }
  public getBudgetDetail() {
    this.investModifyList = [];
    this.purchaseService.getPurchaseBudgetItem(this.projectId).then((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      Object.keys(this.budgetItem).forEach((item: string) => {
        this.budgetItem[item] = resData.value[this.budgetItemMap[item].key];
      });
      this.budgetItem.projectType = this.budgetItem.projectTypeId + ' ' + this.budgetItem.projectType;
      this.budgetItem.managerDepartment = this.budgetItem.managerDepartmentId + ' ' + this.budgetItem.managerDepartment;
      if (resData.value.detailList) {
        resData.value.detailList.forEach((item, index) => {
          this.investModifyList = [...this.investModifyList, {
            id: item[this.budgetItemMap.id.key],
            index: index + 1,
            createDate: item[this.budgetItemMap.createDate.key],
            totalInvest: item[this.budgetItemMap.totalInvest.key],
            availableInvest: item[this.budgetItemMap.availableInvest.key],
            applicant: item[this.budgetItemMap.applicant.key],
            modifyReason: item[this.budgetItemMap.modifyReason.key],
            rejectReason: item[this.budgetItemMap.rejectReason.key],
            quotaStatus: item[this.budgetItemMap.quotaStatus.key]
          }];
        });
      }
      this.isBudgetRefused = resData.value.status === PurchaseServiceNs.ProjectStatus.RefuseAudit;
      if (this.operation === 'audit') {
        this.actionsStatus.agreeAudit = resData.value.quotaStatus === PurchaseServiceNs.ProjectQuotaStatus.WaitingForAudit;
        this.actionsStatus.refuseAudit = resData.value.quotaStatus === PurchaseServiceNs.ProjectQuotaStatus.WaitingForAudit;
        this.actionsStatus.completeBudget = resData.value.quotaStatus === PurchaseServiceNs.ProjectQuotaStatus.AgreeAudit;
      }
      if (this.operation === 'modify') {
        this.budgetDetail.forEach((item) => {
          if (item.field !== 'totalInvest' && item.field !== 'availableInvest') {
            return;
          }
          item.isEdit = true;
        });
        // this.budgetDetail.push({name: '调整原因', field: 'modifyReason', isEdit: true, isFullSpan: true, isNumberInput: false});
        this.actionsStatus.modifyQuota = true;
        this.belongYear = this.budgetItem.beginYear;
        this.budgetItem.belongYear = new Date().getUTCFullYear();
        this.budgetItem.availableInvest = this.ufastUtilService.sub(this.budgetItem.totalInvest, this.budgetItem.inPlanInvest);
      }
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public agreeAudit() {
    this.messageService.showAlertMessage('', '是否确认通过该预算审批', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.purchaseService.passPurchaseBudget(this.projectId).then((resData) => {
          if (resData.code !== 0) {
            this.messageService.showToastMessage(resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('已同意', 'success');
          this.goBack(true);
        }, (error) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public refuseAudit() {
    this.isShowRefuseModal = true;
    this.refuseReason = '';
  }
  public handleRefuseOk() {
    const params = {
      auditRemarks: this.refuseReason,
      id: this.projectId
    };
    if (!this.refuseReason.trim()) {
      this.messageService.showToastMessage('拒绝原因不能为空', 'warning');
      return;
    }
    this.purchaseService.refusePurchaseBudget(params).then((resData) => {
      this.isShowRefuseModal = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('已拒绝', 'success');
      this.goBack(true);
    }, (error) => {
      this.isShowRefuseModal = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public handleCompleteOk() {
    const params = {
      auditRemarks: this.completeReason,
      id: this.projectId
    };
    this.purchaseService.finishPurchaseBudget(params).then((resData) => {
      this.isShowCompleteModal = false;
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('已完结', 'success');
      this.goBack(true);
    }, (error) => {
      this.isShowCompleteModal = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public completeBudget() {
    this.isShowCompleteModal = true;
    this.completeReason = '';
  }
  public modifyQuota() {
    const isYearInvalid = Number(this.budgetItem.beginYear) > Number(this.budgetItem.belongYear);
    if (isYearInvalid) {
      this.messageService.showToastMessage('所属年份小于开始年份,不可调额度', 'error');
      return false;
    }
    const availableInvest = this.budgetItem.availableInvest || 0;
    const inPlanInvest = this.budgetItem.inPlanInvest || 0;
    const totalInvest = this.budgetItem.totalInvest || 0;
    const usedInvest = this.budgetItem.usedInvest || 0;
    const isInvestInvalid = availableInvest > this.ufastUtilService.sub(totalInvest, this.ufastUtilService.sub(inPlanInvest, usedInvest));
    const isAvailableInvalid = availableInvest > this.ufastUtilService.sub(totalInvest, inPlanInvest);
    if (totalInvest < inPlanInvest) {
      this.messageService.showToastMessage('项目总投资不能小于已提报计划总额', 'error');
      return;
    }
    if (availableInvest < usedInvest) {
      this.messageService.showToastMessage('当年可用投资不得小于当年已用投资', 'error');
      return;
    }
    // if (isAvailableInvalid) {
    //   this.messageService.showToastMessage('当年可用投资不得大于项目总投资和已提报计划总额之差', 'error');
    //   return;
    // }
    if (isInvestInvalid) {
      this.messageService.showToastMessage('当年可用投资<=项目总投资-(已提报计划总额-当年已用投资)', 'error');
      return;
    }
    if (this.actionsStatus.modifyQuota) {
      if (!this.modifyReason.trim()) {
        this.messageService.showToastMessage('调整原因必填', 'error');
        return;
      }
    }
    const params = {
      totalAmount: this.budgetItem.totalInvest || 0,
      availableAmount: this.budgetItem.availableInvest || 0,
      id: this.projectId,
      reason: this.modifyReason.trim(),
      belongYear: this.budgetItem.belongYear
    };
    this.purchaseService.modifyPurchaseBudget(params).then((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('已提交', 'success');
      this.goBack(true);
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public trackByItem(index: number, item: any) {
    return item;
  }

  ngOnInit() {
    this.budgetDetail = [
      {name: '业务实体', field: 'orgName', isEdit: false},
      {name: '项目编码', field: 'projectCode', isEdit: false},
      {name: '项目名称', field: 'projectName', isEdit: false},
      {name: '起始年份', field: 'beginYear', isEdit: false},
      {name: '所属年份', field: 'belongYear', isEdit: false},
      {name: '项目经理部', field: 'managerDepartment', isEdit: false},
      {name: '项目类别', field: 'projectType', isEdit: false, isFullSpan: true},
      {name: '项目类别编号', field: 'projectTypeCode', isEdit: false, isFullSpan: true},
      {name: '具体项目序号', field: 'seqNo', isEdit: false},
      {name: '项目总投资(万)', field: 'totalInvest', isEdit: false, isNumberInput: true},
      {name: '当年可用投资(万)', field: 'availableInvest', isEdit: false, isNumberInput: true},
      {name: '已提报计划总额(万)', field: 'inPlanInvest', isEdit: false},
      {name: '当年已用投资(万)', field: 'usedInvest', isEdit: false},
      {name: '状态', field: 'status', pipe: 'projectBudgetStatus', isEdit: false},
      {name: '额度状态', field: 'quotaStatus', pipe: 'projectBudgetQuotaStatus', isEdit: false},
    ];
    this.investTableConfig = {
      showCheckbox: false,
      showPagination: true,
      pageNum: 1,
      pageSize: 10,
      pageSizeOptions: [10, 20, 30, 40, 50],
      total: 0,
      loading: false,
      frontPagination: true,
      headers: [{
        title: '序号',
        field: 'index',
        width: 50,
      }, {
        title: '时间',
        field: 'createDate',
        pipe: 'date: yyyy-MM-dd',
        width: 100,
      }, {
        title: '项目总投资(万)',
        field: 'totalInvest',
        width: 100,
      }, {
        title: '当年可用投资(万)',
        field: 'availableInvest',
        width: 100
      }, {
        title: '填报人',
        field: 'applicant',
        width: 100,
      }, {
        title: '调整原因',
        field: 'modifyReason',
        width: 100,
      }, {
        title: '额度状态',
        field: 'quotaStatus',
        pipe: 'projectBudgetQuotaStatus',
        width: 100,
      }, {
        title: '拒绝原因',
        field: 'rejectReason',
        width: 100,
      }
      ]
    };
    this.getBudgetDetail();
  }

}
