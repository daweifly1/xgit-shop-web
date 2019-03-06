import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {PurchaseServiceNs, PurchaseService} from '../../../../core/trans/purchase.service';
import {ShowMessageService} from '../../../../widget/show-message/show-message';
import {ActionCode} from '../../../../../environments/actionCode';
import {UfastUtilService} from '../../../../core/infra/ufast-util.service';

export interface TabPageType {
  mainPage: number;
  detailPage: number;
  editPage: number;
}
export interface ActionStatus {
  edit: boolean;
  audit: boolean;
}
export interface FilterModel {
  projectCode?: string;
  projectName?: string;
  status?: number;
  allocatePlanner?: string;
  createDateStart?: any;
  createDateEnd?: any;
  purchasePlanId?: string;
}
@Component({
  selector: 'app-device-purchase',
  templateUrl: './device-purchase.component.html',
  styleUrls: ['./device-purchase.component.scss']
})
export class DevicePurchaseComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public tabPageType: TabPageType = {
    mainPage: 0,
    detailPage: 1,
    editPage: 2
  };
  public selectedPage = 0;
filters: FilterModel;
  public devicePurchaseList: PurchaseServiceNs.DevicePurchaseDate[] = [];
  public devicePurchaseTableConfig: UfastTableNs.TableConfig;
  public purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public actionStatus: {[index: string]: ActionStatus} = {};
  public ActionCode = ActionCode;
  public currId = '';
  public operation = '';
  public isShowAdvancedSearch = false;

  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService,
              private ufastService: UfastUtilService) {
                this.filters = {};
               }

  public getDevicePurchaseList = () => {
    Object.keys(this.filters).filter(item => typeof this.filters[item] === 'string').forEach((key: string) => {
      this.filters[key] = this.filters[key].trim();
    });
    this.filters.createDateStart = this.ufastService.getStartDate(this.filters.createDateStart);
    this.filters.createDateEnd = this.ufastService.getEndDate(this.filters.createDateEnd);
    const paramsData = {
      pageSize: this.devicePurchaseTableConfig.pageSize,
      pageNum: this.devicePurchaseTableConfig.pageNum,
      filters: this.filters,
    };
    this.devicePurchaseTableConfig.loading = true;
    this.devicePurchaseTableConfig.checkAll = false;
    this.devicePurchaseList = [];
    this.purchaseService.getDevicePurchaseList(paramsData).subscribe((resData) => {
      this.devicePurchaseTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.devicePurchaseTableConfig.total = resData.value.total;
      resData.value.list.forEach((item) => {
        this.devicePurchaseList.push({
          id: item[this.purchaseDataMap.id.key],
          orgName: item[this.purchaseDataMap.orgName.key],
          purchasePlanId: item[this.purchaseDataMap.purchasePlanId.key],
          monthPlanIn: item[this.purchaseDataMap.monthPlanIn.key],
          status: item[this.purchaseDataMap.status.key],
          reportStatus: item[this.purchaseDataMap.reportStatus.key],
          purchaseType: item[this.purchaseDataMap.purchaseType.key],
          materialType: item[this.purchaseDataMap.materialType.key],
          projectCode: item[this.purchaseDataMap.projectCode.key],
          projectName: item[this.purchaseDataMap.projectName.key],
          remark: item[this.purchaseDataMap.remark.key],
          createDate: item[this.purchaseDataMap.createDate.key],
          isChecked: false
        });
        this.actionStatus[item[this.purchaseDataMap.id.key]] = {
          audit: item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.WaitAudit,
          edit: item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.WaitSubmit ||
            item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.RefuseAudit ||
            item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.MaterialRefuseAudit
        };
      });
    }, (error) => {
      this.devicePurchaseTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showAdvancedSearch() {
    this.isShowAdvancedSearch = true;
  }
  public closeAdvancedSearch() {
    this.isShowAdvancedSearch = false;
  }
  public resetSearch() {
    Object.keys(this.filters).forEach((item) => {
      this.filters[item] = null;
    });
    this.getDevicePurchaseList();
  }
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.devicePurchaseList.length; i < len; i++) {
      this.devicePurchaseList[i][this.devicePurchaseTableConfig.checkRowField] = isAllChoose;
    }
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.devicePurchaseTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.devicePurchaseTableConfig.checkAll = this.devicePurchaseList.every((item) => {
        return item.isChecked === true;
      });
    }
  }
  public addNewPlan() {
    this.currId = '';
    this.selectedPage = this.tabPageType.editPage;
  }
  public reportDevicePurchase() {
    const planChecked = [];
    let isHasErrorStatus = false;
    this.devicePurchaseList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      planChecked.push({id: item.id});
      if (item.status !== PurchaseServiceNs.PurchasePlanStatus.AgreeAudit) {
        isHasErrorStatus = true;
        return;
      }
    });
    if (planChecked.length === 0) {
      this.messageService.showToastMessage('请选择采购计划', 'error');
      return;
    }
    if (isHasErrorStatus) {
      this.messageService.showToastMessage('请选择审核通过的采购计划', 'error');
      return;
    }
    this.messageService.showLoading();
    this.purchaseService.reportFactoryPurchasePlan(planChecked).subscribe((resData) => {
      this.messageService.closeLoading();
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('上报成功', 'success');
      this.getDevicePurchaseList();
    }, (error) => {
      this.messageService.closeLoading();
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showDetailPage(id) {
    this.currId = id;
    this.operation = 'showDetail';
    this.selectedPage = this.tabPageType.detailPage;
  }
  public showEditPage(id) {
    this.currId = id;
    this.selectedPage = this.tabPageType.editPage;
  }
  public showAuditPage(id) {
    this.operation = 'factoryAudit';
    this.currId = id;
    this.selectedPage = this.tabPageType.detailPage;
  }
  public onChildrenEmit(refresh) {
    this.selectedPage = this.tabPageType.mainPage;
    if (refresh) {
      this.getDevicePurchaseList();
    }
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

  ngOnInit() {
    this.devicePurchaseTableConfig = {
      id: 'purchase-factory-device',
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
        {title: '计划月份', field: 'monthPlanIn', pipe: 'date:yyyy-MM', width: 90},
        {title: '状态', field: 'status', pipe: 'purchasePlanStatus', width: 100},
        // {title: this.purchaseDataMap.reportStatus.label, field: 'reportStatus', pipe: 'purchasePlanType', width: 100},
        {title: '采购方式', field: 'purchaseType', pipe: 'purchaseType', width: 100},
        // {title: this.purchaseDataMap.materialType.label, field: 'materialType', width: 80},
        {title: '项目编码', field: 'projectCode', width: 100},
        {title: '项目名称', field: 'projectName', width: 100},
        {title: '创建日期', field: 'createDate', pipe: 'date: yyyy-MM-dd', width: 80},
      ]
    };
    this.getDevicePurchaseList();
  }

}
