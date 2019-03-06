import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PurchaseServiceNs, PurchaseService} from '../../../../core/trans/purchase.service';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ActionCode} from '../../../../../environments/actionCode';
import {ShowMessageService} from '../../../../widget/show-message/show-message';

export interface TabPageType {
  purchasePlanList: number;
  purchasePlanDetail: number;
  purchasePlanEdit: number;
}
export interface ActionStatus {
  edit: boolean;
  audit: boolean;
}
@Component({
  selector: 'app-material-parts-purchase',
  templateUrl: './material-parts-purchase.component.html',
  styleUrls: ['./material-parts-purchase.component.scss']
})
export class MaterialPartsPurchaseComponent implements OnInit {
  @ViewChild('searchBarLeftTpl') searchBarLeftTpl: TemplateRef<any>;
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public selectedPage = 0;
  public tabPageType: TabPageType = {
    purchasePlanList: 0,
    purchasePlanDetail: 1,
    purchasePlanEdit: 2
  };
  public filters = {
    monthPlanIn: '',
    status: null,
    purchasePlanId: '',
    materialType: null,
    materialCode: '',
    allocatePlanner: '',
    purchasePlanType: null
  };
  public isShowAdvancedSearch = false;
  public materialTypeList = this.purchaseService.materialTypeList;
  public purchasePlanTypeList = this.purchaseService.purchasePlanTypeList;
  private purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public purchasePlanList: PurchaseServiceNs.PurchasePlanData[] = [];
  public purchasePlanTableConfig: UfastTableNs.TableConfig;
  public actionStatus: {[index: string]: ActionStatus} = {};
  public ActionCode = ActionCode;
  public currId = '';
  public operation = '';
  private planChecked = [];

  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService) { }
  public getMaterialPartsPurchaseList = () => {
    const filters = {};
    filters[this.purchaseDataMap.monthPlanIn.key] = this.filters.monthPlanIn;
    filters[this.purchaseDataMap.status.key] = this.filters.status;
    filters[this.purchaseDataMap.purchasePlanId.key] = this.filters.purchasePlanId.trim();
    filters[this.purchaseDataMap.materialCode.key] = this.filters.materialCode;
    filters[this.purchaseDataMap.materialType.key] = this.filters.materialType;
    filters[this.purchaseDataMap.allocatePlanner.key] = this.filters.allocatePlanner.trim();
    filters[this.purchaseDataMap.purchasePlanType.key] = this.filters.purchasePlanType;
    const paramsData = {
      filters: filters,
      pageSize: this.purchasePlanTableConfig.pageSize,
      pageNum: this.purchasePlanTableConfig.pageNum
    };
    this.purchasePlanList = [];
    this.purchasePlanTableConfig.loading = true;
    this.purchasePlanTableConfig.checkAll = false;
    this.purchaseService.getMaterialPurchaseList(paramsData).subscribe((resData) => {
      this.purchasePlanTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.purchasePlanTableConfig.total = resData.value.total;
      resData.value.list.forEach((item) => {
        this.purchasePlanList.push({
          id: item[this.purchaseDataMap.id.key],
          orgName: item[this.purchaseDataMap.orgName.key],
          purchasePlanId: item[this.purchaseDataMap.purchasePlanId.key],
          monthPlanIn: item[this.purchaseDataMap.monthPlanIn.key],
          businessType: item[this.purchaseDataMap.businessType.key],
          materialType: item[this.purchaseDataMap.materialType.key],
          purchasePlanType: item[this.purchaseDataMap.purchasePlanType.key],
          totalCount: item[this.purchaseDataMap.totalCount.key],
          totalAmount: item[this.purchaseDataMap.totalAmount.key],
          totalPrice: item[this.purchaseDataMap.totalPrice.key],
          purchaseType: item[this.purchaseDataMap.purchaseType.key],
          allocatePlanner: item[this.purchaseDataMap.allocatePlanner.key],
          departmentName: item[this.purchaseDataMap.departmentName.key],
          allocateDepartmentDate: item[this.purchaseDataMap.allocateDepartmentDate.key],
          allocatePlannerDate: item[this.purchaseDataMap.allocatePlannerDate.key],
          status: item[this.purchaseDataMap.status.key],
          isChecked: false
        });
        this.actionStatus[item.id] = {
          audit: item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.WaitAudit,
          edit: item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.WaitSubmit ||
              item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.RefuseAudit ||
              item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.MaterialRefuseAudit
        };
      });
    }, (error) => {
      this.purchasePlanTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public resetSearch() {
    this.filters.monthPlanIn = '';
    this.filters.status = null;
    this.filters.purchasePlanId = '';
    this.filters.materialCode = '';
    this.filters.materialType = null;
    this.filters.allocatePlanner = '';
    this.filters.purchasePlanType = null;
    this.getMaterialPartsPurchaseList();
  }
  public showAdvancedSearch() {
    this.isShowAdvancedSearch = true;
  }
  public closeAdvancedSearch() {
    this.isShowAdvancedSearch = false;
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.purchasePlanList.length; i < len; i++) {
      this.purchasePlanList[i][this.purchasePlanTableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.purchasePlanTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.purchasePlanTableConfig.checkAll = this.purchasePlanList.every((item) => {
        return item.isChecked === true;
      });
    }
  }
  public showPurchaseDetail(id) {
    this.currId = id;
    this.operation = 'showDetail';
    this.selectedPage = this.tabPageType.purchasePlanDetail;
  }
  public createPurchasePlanSelf() {
    this.currId = '';
    this.selectedPage = this.tabPageType.purchasePlanEdit;
  }
  private beforeReport(isReportUrgencyPlan) {
    this.planChecked = [];
    let isHasDiffPlanType = false;
    let isHasErrorStatus = false;
    this.purchasePlanList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      this.planChecked.push({id: item.id});
      if (item.purchasePlanType !== PurchaseServiceNs.PurchasePlanType.UrgencyPlan) {
        isHasDiffPlanType = true;
        return;
      }
      if (item.status !== PurchaseServiceNs.PurchasePlanStatus.AgreeAudit) {
        isHasErrorStatus = true;
        return;
      }
    });
    if (this.planChecked.length === 0) {
      this.messageService.showToastMessage('请勾选要上报的计划', 'warning');
      return false;
    }
    if (isHasErrorStatus) {
      this.messageService.showToastMessage('请选择审核通过的计划进行上报', 'warning');
      return false;
    }
    if (isHasDiffPlanType && isReportUrgencyPlan) {
      this.messageService.showToastMessage('请选择急件计划', 'warning');
      return false;
    }
    return true;
  }
  public reportPurchasePlan() {
    if (!this.beforeReport(false)) {
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.reportFactoryPurchasePlan(this.planChecked).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('上报成功', 'success');
      this.getMaterialPartsPurchaseList();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public reportUrgencyPurchasePlan() {
    if (!this.beforeReport(true)) {
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.reportFactoryPurchasePlan(this.planChecked).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('上报成功', 'success');
      this.getMaterialPartsPurchaseList();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showEditPage(id) {
    this.currId = id;
    this.selectedPage = this.tabPageType.purchasePlanEdit;
  }
  public showAuditPage(id) {
    this.operation = 'factoryAudit';
    this.currId = id;
    this.selectedPage = this.tabPageType.purchasePlanDetail;
  }
  public onChildrenEmit(refresh) {
    this.selectedPage = this.tabPageType.purchasePlanList;
    if (refresh) {
      this.getMaterialPartsPurchaseList();
    }
  }

  ngOnInit() {
    this.purchasePlanTableConfig = {
      id: 'purchase-factory-material',
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
        {title: '操作', tdTemplate: this.operationTpl, fixed: true, width: 100},
        {title: '业务实体', field: 'orgName', width: 100},
        {title: '采购计划编号', tdTemplate: this.showDetailTpl, width: 160},
        {title: '计划月份', field: 'monthPlanIn', pipe: 'date:yyyy-MM', width: 100},
        {title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 80},
        {title: '业务类型', field: 'businessType', width: 100},
        {title: '采购计划类型', field: 'purchasePlanType', pipe: 'purchasePlanType', width: 120},
        {title: '条目总数', field: 'totalCount', width: 80},
        {title: '总数量', field: 'totalAmount', width: 80},
        {title: '采购方式', field: 'purchaseType', pipe: 'purchaseType', width: 100},
        {title: '计划员', field: 'allocatePlanner', width: 100},
        {title: '状态', field: 'status', pipe: 'purchasePlanStatus', width: 100},
      ]
    };
    this.getMaterialPartsPurchaseList();
  }

}

