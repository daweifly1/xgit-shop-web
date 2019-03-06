import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {PurchaseServiceNs, PurchaseService} from '../../../../core/trans/purchase.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';
import {ActionCode} from '../../../../../environments/actionCode';
import {environment} from '../../../../../environments/environment';

export interface TabPageType {
  mainPage: number;
  executePage: number;
  materialDetailPage: number;
  deviceDetailPage: number;
  dividePage: number;
}
@Component({
  selector: 'app-purchase-plan-execute',
  templateUrl: './purchase-plan-execute.component.html',
  styleUrls: ['./purchase-plan-execute.component.scss']
})
export class PurchasePlanExecuteComponent implements OnInit {
  @ViewChild('executeTpl') executeTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  @ViewChild('divideTpl') divideTpl: TemplateRef<any>;
  public selectedPage = 0;
  public tabPageType: TabPageType = {
    mainPage: 0,
    executePage: 1,
    materialDetailPage: 2,
    deviceDetailPage: 3,
    dividePage: 4
  };
  public detailSearchBy = 'divideNo';
  public operation = 'showDetail';
  public currPurchaseId = '';
  public filters = {
    orgName: '',
    monthPlanIn: '',
    purchasePlanId: '',
    materialType: null,
    materialCode: '',
    allocateDepartment: '',
    salesmanName: '',
    isAgreement: null,
    isBuyAgain: null
  };
  public purchaseExecuteList = [];
  public purchaseExecuteTableConfig: UfastTableNs.TableConfig;
  public purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public isShowAdvancedSearch = false;
  public materialTypeList = this.purchaseService.allMaterialTypeList;
  public yesOrNoList = [
    {value: 0, label: '否'},
    {value: 1, label: '是'},
  ];
  public selectedPlan = [];
  public currPurchasePlan: { id: string; purchaseAmount: number; };
  public isShowDivideModal = false;
  public divideAmount = [{qty: 0}];
  public ActionCode = ActionCode;
  public lengthLimit = {
    precision: environment.otherData.materialNumDec
  };
  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService,
              private ufastService: UfastUtilService) {
    this.currPurchasePlan = {
      id: '',
      purchaseAmount: null
    };
  }

  public getPurchaseExecuteList = () => {
    const paramsData = {
      pageSize: this.purchaseExecuteTableConfig.pageSize,
      pageNum: this.purchaseExecuteTableConfig.pageNum,
      filters: {}
    };
    Object.keys(this.filters).forEach((item) => {
      if (item === 'isAgreement' || item === 'isBuyAgain') {
        return;
      }
      if (item === 'monthPlanIn' || item === 'materialType') {
        paramsData.filters[this.purchaseDataMap[item].key] = this.filters[item];
        return;
      }
      paramsData.filters[this.purchaseDataMap[item].key] = this.filters[item].trim();
    });
    this.purchaseExecuteTableConfig.loading = true;
    this.purchaseService.getPurchaseExecuteList(paramsData).subscribe((resData) => {
      this.purchaseExecuteTableConfig.loading = false;
      this.purchaseExecuteList = [];
      this.purchaseExecuteTableConfig.checkAll = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.purchaseExecuteList = resData.value.list;
      this.purchaseExecuteTableConfig.total = resData.value.total;
    }, (error) => {
      this.purchaseExecuteTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public resetSearch() {
    Object.keys(this.filters).forEach((item) => {
      this.filters[item] = '';
    });
    this.getPurchaseExecuteList();
  }
  public showAdvancedSearch() {
    this.isShowAdvancedSearch = true;
  }
  public closeAdvancedSearch() {
    this.isShowAdvancedSearch = false;
  }
  private isAllChoose(isAllChoose: boolean): void {
    this.purchaseExecuteList.forEach((item) => {
      item[this.purchaseExecuteTableConfig.checkRowField] = isAllChoose;
    });
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.purchaseExecuteTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.purchaseExecuteTableConfig.checkAll = this.purchaseExecuteList.every((item) => {
        return item.isChecked === true;
      });
    }
  }
  public executePlan() {
    this.selectedPlan = [];
    this.purchaseExecuteList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      this.selectedPlan.push(item);
    });
    if (this.selectedPlan.length === 0) {
      this.messageService.showToastMessage('请选择要执行的计划', 'error');
      return;
    }
    const diffRow = this.selectedPlan.find(item => item.materialType !== this.selectedPlan[0].materialType);
    if (diffRow) {
      this.messageService.showToastMessage('所选行的物料类型必须一致', 'error');
      return;
    }
    this.selectedPage = this.tabPageType.executePage;
  }
  public showDetail(purchasePlanId, materialType) {
    this.currPurchaseId = purchasePlanId;
    if (materialType === PurchaseServiceNs.MaterialType.Device) {
      this.selectedPage = this.tabPageType.deviceDetailPage;
      return;
    }
    this.selectedPage = this.tabPageType.materialDetailPage;
  }
  public onChildEmit(refresh) {
    this.selectedPage = this.tabPageType.mainPage;
    if (!refresh) {
      return;
    }
    this.getPurchaseExecuteList();
  }
  public showDivideModal(id) {
    this.divideAmount = [{qty: 0}];
    const planItem = this.purchaseExecuteList.find((item) => item.id === id);
    this.currPurchasePlan.id = planItem.id;
    this.currPurchasePlan.purchaseAmount = planItem.quantity;
    this.isShowDivideModal = true;
  }
  public addPlan(i) {
    this.divideAmount.splice(i + 1, 0, {qty: 0});
  }
  public deletePlan(i) {
    if (this.divideAmount.length <= 1) {
      this.messageService.showToastMessage('不可再删减', 'warning');
      return;
    }
    this.divideAmount.splice(i, 1);
  }
  public dividePlan() {
    if (this.divideAmount.length < 2) {
      this.messageService.showToastMessage('拆分的采购计划行数必须大于等于2', 'warning');
      return;
    }
    let sum = 0;
    const paramsData = [];
    for (let i = 0, len = this.divideAmount.length; i < len; i++) {
      const item = this.divideAmount[i];
      if (!item.qty) {
        this.messageService.showToastMessage('拆分数量必须大于0', 'warning');
        return;
      }
      sum = this.ufastService.add(sum, item.qty);
      paramsData.push({
        pid: this.currPurchasePlan.id,
        quantity: item.qty
      });
    }
    if (sum !== this.currPurchasePlan.purchaseAmount) {
      this.messageService.showToastMessage('子计划采购数量总和' + sum + '不等于原采购计划总和' + this.currPurchasePlan.purchaseAmount, 'error');
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.dividePurchasePlan(paramsData).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('拆分成功', 'success');
      this.isShowDivideModal = false;
      this.getPurchaseExecuteList();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public planToReturn() {
    const ids = [];
    this.purchaseExecuteList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      ids.push(item.id);
    });
    if (!ids.length) {
      this.messageService.showToastMessage('请选择要退回的计划', 'error');
      return;
    }
    this.purchaseService.planReturnToDept(ids).subscribe((resData: PurchaseServiceNs.UfastHttpResT<any>) => {
      this.getPurchaseExecuteList();
      this.messageService.showToastMessage('操作成功', 'success');
    });
  }

  ngOnInit() {
    this.purchaseExecuteTableConfig = {
      id: 'purchase-execute',
      showCheckbox: true,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      checkRowField: 'isChecked',
      checkAll: false,
      splitPage: true,
      headers: [
        {title: '操作', tdTemplate: this.divideTpl, fixed: true, width: 60},
        {title: '业务实体', field: 'orgName', width: 100},
        {title: '采购计划编号', tdTemplate: this.showDetailTpl, width: 170},
        {title: '行号', field: 'indexNo', width: 80},
        {title: '计划月份', field: 'planMonth', pipe: 'date: yyyy-MM', width: 100},
        {title: '业务类型', field: 'businessType', width: 100},
        {title: '采购计划类型', field: 'purchasePlanType', pipe: 'purchasePlanType', width: 120},
        {title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 100},
        {title: '物料编码', field: 'materialNo', width: 100},
        {title: '物料描述', field: 'materialDesc', width: 140},
        {title: '技术参数', field: 'technicalParameters', width: 100},
        {title: '单位', field: 'unit', width: 100},
        {title: '采购数量', field: 'quantity', width: 100},
        {title: '需求日期', field: 'needDate', pipe: 'date: yyyy-MM-dd', width: 100},
        {title: '采购方式', field: 'purchaseWay', pipe: 'purchaseType', width: 100},
        {title: '二级单位计划员', field: 'factoryPlanner', width: 120},
        {title: '业务员', field: 'salesmanName', width: 100},
        {title: '下达业务员时间', field: 'salesmanDate', width: 120, pipe: 'date: yyyy-MM-dd'},
        {title: '商务科室', field: 'businessDepartmentName', width: 100},
        {title: '项目编码', field: 'projectCode', width: 100},
        {title: '项目名称', field: 'projectName', width: 100},
        {title: '计划行状态', field: 'allotStatus', pipe: 'purchaseExecuteStatus', width: 120},
      ]
    };
    this.getPurchaseExecuteList();
  }

}
