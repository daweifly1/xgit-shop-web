import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PurchaseServiceNs, PurchaseService} from '../../../../core/trans/purchase.service';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ActionCode} from '../../../../../environments/actionCode';
import {ShowMessageService} from '../../../../widget/show-message/show-message';

export interface TabPageType {
  purchasePlanList: number;
  materialPurchaseDetail: number;
  purchasePlanEdit: number;
  devicePurchaseDetail: number;
}
export interface ActionStatus {
  audit: boolean;
}
@Component({
  selector: 'app-purchase-plan',
  templateUrl: './purchase-plan.component.html',
  styleUrls: ['./purchase-plan.component.scss']
})
export class PurchasePlanComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public selectedPage = 0;
  public tabPageType: TabPageType = {
    purchasePlanList: 0,
    materialPurchaseDetail: 1,
    purchasePlanEdit: 2,
    devicePurchaseDetail: 3,
  };
  public filters = {
    orgName: '',
    monthPlanIn: '',
    status: null,
    purchasePlanId: '',
    materialType: null,
    allocateDepartment: '',
    allocatePlanner: '',
    purchasePlanType: null
  };
  public isShowAdvancedSearch = false;
  public statusList = this.purchaseService.purchasePlanAuditStatusList;
  public materialTypeList = this.purchaseService.allMaterialTypeList;
  public purchasePlanTypeList = this.purchaseService.purchasePlanTypeList;
  private purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public purchasePlanList: PurchaseServiceNs.PurchasePlanData[] = [];
  public purchasePlanTableConfig: UfastTableNs.TableConfig;
  public actionStatus: {[index: string]: ActionStatus} = {};
  public ActionCode = ActionCode;
  public currId = '';
  public operation = '';

  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService) { }
  public getPurchaseList = () => {
    const filters = {};
    filters[this.purchaseDataMap.monthPlanIn.key] = this.filters.monthPlanIn;
    filters[this.purchaseDataMap.status.key] = this.filters.status;
    filters[this.purchaseDataMap.purchasePlanId.key] = this.filters.purchasePlanId.trim();
    filters[this.purchaseDataMap.materialType.key] = this.filters.materialType;
    // filters[this.purchaseDataMap.allocateDepartment.key] = this.filters.allocateDepartment.trim();
    filters[this.purchaseDataMap.allocatePlanner.key] = this.filters.allocatePlanner.trim();
    filters[this.purchaseDataMap.purchasePlanType.key] = this.filters.purchasePlanType;
    const paramsData = {
      filters: filters,
      pageSize: this.purchasePlanTableConfig.pageSize,
      pageNum: this.purchasePlanTableConfig.pageNum
    };
    this.purchasePlanList = [];
    this.purchaseService.getPurchaseList(paramsData).subscribe((resData) => {
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
          purchasePlanType: item[this.purchaseDataMap.purchasePlanType.key],
          materialType: item[this.purchaseDataMap.materialType.key],
          totalCount: item[this.purchaseDataMap.totalCount.key],
          totalAmount: item[this.purchaseDataMap.totalAmount.key],
          totalPrice: item[this.purchaseDataMap.totalPrice.key],
          purchaseType: item[this.purchaseDataMap.purchaseType.key],
          allocatePlanner: item[this.purchaseDataMap.allocatePlanner.key],
          allocateDepartment: item[this.purchaseDataMap.allocateDepartment.key],
          allocateDepartmentDate: item[this.purchaseDataMap.allocateDepartmentDate.key],
          allocatePlannerDate: item[this.purchaseDataMap.allocatePlannerDate.key],
          status: item[this.purchaseDataMap.status.key]
        });
        this.actionStatus[item.id] = {
          audit: item[this.purchaseDataMap.status.key] === PurchaseServiceNs.PurchasePlanStatus.HasReported
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
    this.filters.materialType = null;
    this.filters.allocateDepartment = '';
    this.filters.allocatePlanner = '';
    this.filters.purchasePlanType = null;
    this.getPurchaseList();
  }
  public showAdvancedSearch() {
    this.isShowAdvancedSearch = true;
  }
  public closeAdvancedSearch() {
    this.isShowAdvancedSearch = false;
  }
  public showPurchaseDetail(id, materialType) {
    this.currId = id;
    this.operation = 'showDetail';
    if (materialType === PurchaseServiceNs.MaterialType.Device) {
      this.selectedPage = this.tabPageType.devicePurchaseDetail;
      return;
    }
    this.selectedPage = this.tabPageType.materialPurchaseDetail;
  }
  public showAuditPage(id, materialType) {
    this.operation = 'materialAudit';
    this.currId = id;
    if (materialType === PurchaseServiceNs.MaterialType.Device) {
      this.selectedPage = this.tabPageType.devicePurchaseDetail;
      return;
    }
    this.selectedPage = this.tabPageType.materialPurchaseDetail;
  }
  public onChildrenEmit(refresh) {
    this.selectedPage = this.tabPageType.purchasePlanList;
    if (refresh) {
      this.getPurchaseList();
    }
  }

  ngOnInit() {
    this.purchasePlanTableConfig = {
      id: 'purchase-audit',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        {title: '操作', tdTemplate: this.operationTpl, fixed: true, width: 80},
        {title: '业务实体', field: 'orgName', width: 100},
        {title: '采购计划编号', tdTemplate: this.showDetailTpl, width: 180},
        {title: '计划月份', field: 'monthPlanIn', pipe: 'date:yyyy-MM', width: 100},
        {title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 100},
        {title: '业务类型', field: 'businessType', width: 100},
        {title: '采购计划类型', field: 'purchasePlanType', pipe: 'purchasePlanType', width: 120},
        {title: '条目总数', field: 'totalCount', width: 100},
        {title: '总数量', field: 'totalAmount', width: 80},
        {title: '采购方式', field: 'purchaseType', pipe: 'purchaseType', width: 100},
        {title: '计划员', field: 'allocatePlanner', width: 120},
        {title: '状态', field: 'status', pipe: 'purchasePlanStatus', width: 100},
      ]
    };
    this.getPurchaseList();
  }

}
