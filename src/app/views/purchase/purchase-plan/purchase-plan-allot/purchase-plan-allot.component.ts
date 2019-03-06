import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PurchaseService, PurchaseServiceNs } from '../../../../core/trans/purchase.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { UserService } from '../../../../core/common-services/user.service';
import { DeptService, DeptServiceNs } from '../../../../core/common-services/dept.service';
import { ActionCode } from '../../../../../environments/actionCode';

export interface TabPageType {
  mainPage: number;
  materialDetailPage: number;
  deviceDetailPage: number;
}
@Component({
  selector: 'app-purchase-plan-allot',
  templateUrl: './purchase-plan-allot.component.html',
  styleUrls: ['./purchase-plan-allot.component.scss']
})
export class PurchasePlanAllotComponent implements OnInit {
  @ViewChild('plannerSelectedTpl') plannerSelectedTpl: TemplateRef<any>;
  @ViewChild('departmentSelectedTpl') departmentSelectedTpl: TemplateRef<any>;
  @ViewChild('modifyTpl') modifyTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public tabPageType: TabPageType = {
    mainPage: 0,
    materialDetailPage: 1,
    deviceDetailPage: 2,
  };
  public selectedPage = 0;
  public filters = {
    orgName: '',
    monthPlanIn: '',
    materialCode: '',
    purchasePlanId: '',
    materialType: null,
    auditStartDate: null,
    auditEndDate: null,
    allocateDepartment: '',
    salesmanName: '',
    purchasePlanType: null,
    isHasDepartment: null,
    isHasPlanner: null
  };
  public materialTypeList = this.purchaseService.allMaterialTypeList;
  public purchasePlanTypeList = this.purchaseService.purchasePlanTypeList;
  public yesOrNoList = [
    { value: 0, label: '否' },
    { value: 1, label: '是' },
  ];
  public isShowAdvancedSearch = false;
  public purchasePlanAllotList: PurchaseServiceNs.PurchasePlanAllotData[] = [];
  public purchasePlanAllotTableConfig: UfastTableNs.TableConfig;
  public purchaseDataMap = this.purchaseService.purchasePlanDataMap;
  public isShowPlannerListModal = false;
  public plannerListTableConfig: UfastTableNs.TableConfig;
  public plannerList: { name: string; userId: string }[] = [];
  public isShowDepartmentListModal = false;
  public departmentListTableConfig: UfastTableNs.TableConfig;
  public departmentList: { name: string; id: string }[] = [];
  public currPurchasePlanId = '';
  public planSelected = [];
  public detailSearchBy = 'no';
  public ActionCode = ActionCode;

  constructor(private purchaseService: PurchaseService,
    private messageService: ShowMessageService,
    private ufastUtilService: UfastUtilService,
    private userService: UserService,
    private deptService: DeptService) { }

  public getPurchasePlanAllotList = () => {
    this.purchasePlanAllotList = [];
    const filters = {};
    Object.keys(this.filters).forEach((key) => {
      if (key === 'auditStartDate') {
        filters[this.purchaseDataMap[key].key] = this.ufastUtilService.getStartDate(this.filters[key]);
        return;
      }
      if (key === 'auditEndDate') {
        filters[this.purchaseDataMap[key].key] = this.ufastUtilService.getEndDate(this.filters[key]);
        return;
      }
      filters[this.purchaseDataMap[key].key] = (typeof this.filters[key] === 'number'
        || this.filters[key] === null || key === 'monthPlanIn')
        ? this.filters[key] : this.filters[key].trim();
    });
    const paramsData = {
      filters: filters,
      pageSize: this.purchasePlanAllotTableConfig.pageSize,
      pageNum: this.purchasePlanAllotTableConfig.pageNum
    };
    this.purchasePlanAllotTableConfig.loading = true;
    this.purchasePlanAllotTableConfig.checkAll = false;
    this.purchaseService.getPurchaseAllotList(paramsData).subscribe((resData) => {
      this.purchasePlanAllotTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.purchasePlanAllotTableConfig.total = resData.value.total;
      this.purchasePlanAllotList = [];
      resData.value.list.forEach((listItem) => {
        this.purchasePlanAllotList.push({
          allocateDepartment: listItem[this.purchaseDataMap.allocateDepartment.key],
          orgName: listItem[this.purchaseDataMap.orgName.key],
          materialCode: listItem[this.purchaseDataMap.materialCode.key],
          materialDescription: listItem[this.purchaseDataMap.materialDescription.key],
          materialName: listItem[this.purchaseDataMap.materialName.key],
          technicalParameters: listItem[this.purchaseDataMap.technicalParameters.key],
          deviceDesc: listItem[this.purchaseDataMap.materialType.key] === PurchaseServiceNs.MaterialType.SpaceParts ? '' :
            listItem[this.purchaseDataMap.deviceDesc.key],
          unit: listItem[this.purchaseDataMap.unit.key],
          purchaseAmount: listItem[this.purchaseDataMap.purchaseAmount.key],
          demandDate: listItem[this.purchaseDataMap.demandDate.key],
          factoryPlanner: listItem[this.purchaseDataMap.factoryPlanner.key],
          allotStatus: listItem[this.purchaseDataMap.allotStatus.key],
          allocateDepartmentDate: listItem[this.purchaseDataMap.allocateDepartmentDate.key],
          allocateSalesmanDate: listItem[this.purchaseDataMap.allocateSalesmanDate.key],
          salesmanName: listItem[this.purchaseDataMap.salesmanName.key],
          purchasePlanId: listItem[this.purchaseDataMap.purchasePlanId.key],
          lineNo: listItem[this.purchaseDataMap.lineNo.key],
          monthPlanIn: listItem[this.purchaseDataMap.monthPlanIn.key],
          businessType: listItem[this.purchaseDataMap.businessType.key],
          purchasePlanType: listItem[this.purchaseDataMap.purchasePlanType.key],
          materialType: listItem[this.purchaseDataMap.materialType.key],
          purchaseType: listItem[this.purchaseDataMap.purchaseType.key],
          projectCode: listItem[this.purchaseDataMap.projectCode.key],
          projectName: listItem[this.purchaseDataMap.projectName.key],
          auditDate: listItem[this.purchaseDataMap.auditDate.key],
          isChecked: false,
          id: listItem[this.purchaseDataMap.id.key]
        });
      });
    }, (error) => {
      this.purchasePlanAllotTableConfig.loading = false;
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
      this.filters[item] = '';
    });
    this.getPurchasePlanAllotList();
  }
  private isAllChoose(isAllChoose: boolean): void {
    this.purchasePlanAllotList.forEach((item) => {
      item[this.purchasePlanAllotTableConfig.checkRowField] = isAllChoose;
    });
  }
  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.purchasePlanAllotTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.purchasePlanAllotTableConfig.checkAll = this.purchasePlanAllotList.every((item) => {
        return item.isChecked === true;
      });
    }
  }
  public getDepartmentList = () => {
    const id = '0';
    this.departmentListTableConfig.loading = true;
    this.deptService.getDeptList(id).subscribe((resData: DeptServiceNs.UfastHttpAnyResModel) => {
      this.departmentListTableConfig.loading = false;
      this.departmentList = [];
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      resData.value.forEach((item) => {
        this.departmentList.push({ name: item.name, id: item.id });
      });
    }, (error: any) => {
      this.departmentListTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public openModifyDepartmentModal() {
    this.planSelected = [];
    let isStatusError = false;
    this.purchasePlanAllotList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      this.planSelected.push(item.id);
      if (item.allotStatus === PurchaseServiceNs.AllotStatus.HasAllocated || item.allotStatus === PurchaseServiceNs.AllotStatus.HasClosed) {
        isStatusError = true;
        return;
      }
    });
    if (this.planSelected.length === 0) {
      this.messageService.showToastMessage('请选择采购计划', 'warning');
      return;
    }
    if (isStatusError) {
      this.messageService.showToastMessage('请选择可分配科室的采购计划', 'warning');
      return;
    }
    this.isShowDepartmentListModal = true;
    this.getDepartmentList();
  }
  public modifyDepartment(id, name) {
    const paramsData = [];
    this.planSelected.forEach((item) => {
      paramsData.push({
        id: item,
        businessDepartmentId: id,
        businessDepartmentName: name
      });
    });
    this.purchaseService.allotDepartment(paramsData).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('分配成功', 'success');
      this.isShowDepartmentListModal = false;
      this.getPurchasePlanAllotList();
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public assignDepartment() {
    this.planSelected = [];
    let isStatusError = false;
    this.purchasePlanAllotList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      this.planSelected.push(item.id);
      if (!item.allocateDepartment && (item.allotStatus !== PurchaseServiceNs.AllotStatus.HasAllocated &&
        item.allotStatus !== PurchaseServiceNs.AllotStatus.HasClosed)) {
        isStatusError = true;
        return;
      }
    });
    if (this.planSelected.length === 0) {
      this.messageService.showToastMessage('请选择采购计划', 'warning');
      return;
    }
    if (isStatusError) {
      this.messageService.showToastMessage('请选择已分配科室的采购计划', 'warning');
      return;
    }
    this.purchaseService.assignDepartment(this.planSelected).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('下达成功', 'success');
      this.getPurchasePlanAllotList();
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public getPlannerList = () => {
    const paramsData = {
      filters: {},
      pageNum: this.plannerListTableConfig.pageNum,
      pageSize: this.plannerListTableConfig.pageSize
    };
    this.plannerListTableConfig.loading = true;
    this.userService.getUserList(paramsData).subscribe((resData) => {
      this.plannerListTableConfig.loading = false;
      this.plannerList = [];
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.plannerListTableConfig.total = resData.value.total || 0;
      resData.value.list.forEach((item) => {
        this.plannerList.push({
          name: item.name,
          userId: item.userId
        });
      });
    }, (error) => {
      this.plannerListTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public openModifyPlannerModal() {
    this.planSelected = [];
    let isStatusError = false;
    this.purchasePlanAllotList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      this.planSelected.push(item.id);
      if (item.allotStatus === PurchaseServiceNs.AllotStatus.InitStatus || (
        item.allotStatus === PurchaseServiceNs.AllotStatus.HasAllocated || item.allotStatus === PurchaseServiceNs.AllotStatus.HasClosed)) {
        isStatusError = true;
        return;
      }
    });
    if (this.planSelected.length === 0) {
      this.messageService.showToastMessage('请选择采购计划', 'warning');
      return;
    }
    if (isStatusError) {
      this.messageService.showToastMessage('请选择已下达科室的采购计划', 'warning');
      return;
    }
    this.isShowPlannerListModal = true;
    this.getPlannerList();
  }
  public modifyPlanner(id, name) {
    const paramsData = [];
    this.planSelected.forEach((item) => {
      paramsData.push({
        id: item,
        salesmanId: id,
        salesmanName: name
      });
    });
    this.purchaseService.allotPlaner(paramsData).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('分配成功', 'success');
      this.isShowPlannerListModal = false;
      this.getPurchasePlanAllotList();
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public assignPlanner() {
    this.planSelected = [];
    let isStatusError = false;
    this.purchasePlanAllotList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      this.planSelected.push(item.id);
      if (!item.salesmanName && (item.allotStatus !== PurchaseServiceNs.AllotStatus.HasAllocated &&
        item.allotStatus !== PurchaseServiceNs.AllotStatus.HasClosed)) {
        isStatusError = true;
        return;
      }
    });
    if (this.planSelected.length === 0) {
      this.messageService.showToastMessage('请选择采购计划', 'warning');
      return;
    }
    if (isStatusError) {
      this.messageService.showToastMessage('请选择已分配业务员的采购计划', 'warning');
      return;
    }
    this.purchaseService.assignPlanner(this.planSelected).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('下达成功', 'success');
      this.getPurchasePlanAllotList();
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public showDetail(id, materialType) {
    this.currPurchasePlanId = id;
    if (materialType === PurchaseServiceNs.MaterialType.Device) {
      this.selectedPage = this.tabPageType.deviceDetailPage;
      return;
    }
    this.selectedPage = this.tabPageType.materialDetailPage;
  }
  public onChildEmit(refresh) {
    this.selectedPage = this.tabPageType.mainPage;
    if (refresh) {
      this.getPurchasePlanAllotList();
    }
  }
  public disabledEndDate = (endDate) => {
    if (!this.filters.auditStartDate) {
      return false;
    }
    return endDate.getTime() < this.filters.auditStartDate.getTime();
  }
  public disabledStartDate = (startDate) => {
    if (!this.filters.auditEndDate) {
      return false;
    }
    return startDate.getTime() > this.filters.auditEndDate.getTime();
  }
  public planToReturn() {
    const selectPlan = [];
    const ids = [];
    this.purchasePlanAllotList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      selectPlan.push(item);
    });
    if (!selectPlan.length) {
      this.messageService.showToastMessage('请选择要退回的计划', 'warning');
      return;
    }
    let flag = false;
    selectPlan.forEach((item) => {
      if ((item.allotStatus !== PurchaseServiceNs.AllotStatus.HasAssignDepartment) &&
        (item.allotStatus !== PurchaseServiceNs.AllotStatus.HasReturnDept)) {
        flag = true;
        return;
      }
      ids.push(item.id);
    });
    if (flag) {
      this.messageService.showToastMessage('请选择已下达商务科室或已退回科室的计划', 'warning');
      return;
    }

    this.purchaseService.planReturnToManage(ids).subscribe((resData: PurchaseServiceNs.UfastHttpResT<any>) => {
      this.getPurchasePlanAllotList();
      this.messageService.showToastMessage('操作成功', 'success');
    });
  }
  public planToReturnFactory() {
    const selectPlan = [];
    const ids = [];
    this.purchasePlanAllotList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      selectPlan.push(item);
    });
    if (!selectPlan.length) {
      this.messageService.showToastMessage('请选择要退回的计划', 'warning');
      return;
    }
    let returnFlag = false;
    selectPlan.forEach((item) => {
      if ((item.allotStatus !== PurchaseServiceNs.AllotStatus.InitStatus) &&
        (item.allotStatus !== PurchaseServiceNs.AllotStatus.HasReturnManage)) {
          returnFlag = true;
        return;
      }
      ids.push(item.id);
    });
    if (returnFlag) {
      this.messageService.showToastMessage('请选择初始态或已退回管理科的计划', 'warning');
      return;
    }

    this.purchaseService.planReturnToFactory(ids).subscribe((resData: PurchaseServiceNs.UfastHttpResT<any>) => {
      this.getPurchasePlanAllotList();
      this.messageService.showToastMessage('操作成功', 'success');
    });
  }

  ngOnInit() {
    this.purchasePlanAllotTableConfig = {
      id: 'purchase-allot',
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
        { title: '商务科室', field: 'allocateDepartment', width: 100 },
        { title: '业务员', field: 'salesmanName', width: 100 },
        { title: '业务实体', field: 'orgName', width: 100 },
        { title: '物料编码', field: 'materialCode', width: 100 },
        { title: '物料描述', field: 'materialDescription', width: 140 },
        { title: '物料类型', field: 'materialType', pipe: 'materialType2', width: 100 },
        { title: '技术参数', field: 'technicalParameters', width: 100 },
        { title: '单位', field: 'unit', width: 80 },
        { title: '采购数量', field: 'purchaseAmount', width: 100 },
        { title: '需求日期', field: 'demandDate', pipe: 'date: yyyy-MM-dd', width: 100 },
        { title: '二级单位计划员', field: 'factoryPlanner', width: 120 },
        { title: '计划行状态', field: 'allotStatus', pipe: 'purchaseAllotStatus', width: 120 },
        { title: '下达商务科室时间', field: 'allocateDepartmentDate', pipe: 'date: yyyy-MM-dd HH:mm', width: 140 },
        { title: '采购计划编号', tdTemplate: this.showDetailTpl, width: 120 },
        { title: '行号', field: 'lineNo', width: 80 },
        { title: '计划月份', field: 'monthPlanIn', pipe: 'date: yyyy-MM', width: 100 },
        { title: '业务类型', field: 'businessType', width: 100 },
        { title: '采购计划类型', field: 'purchasePlanType', pipe: 'purchasePlanType', width: 120 },
        { title: '采购方式', field: 'purchaseType', pipe: 'purchaseType', width: 100 },
        { title: '项目编码', field: 'projectCode', width: 100 },
        { title: '项目名称', field: 'projectName', width: 100 },
        { title: '审批时间', field: 'auditDate', pipe: 'date: yyyy-MM-dd HH:mm', width: 130 },
      ]
    };
    this.plannerListTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        { title: '用户名', field: 'name', width: 100 },
        { title: '用户ID', field: 'userId', width: 140 },
        { title: '操作', tdTemplate: this.plannerSelectedTpl, width: 100 }
      ]
    };
    this.departmentListTableConfig = {
      pageSize: 10,
      showCheckbox: false,
      showPagination: false,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      yScroll: 350,
      headers: [
        { title: '科室', field: 'name', width: 100 },
        // {title: '科室Id', field: 'id', width: 140},
        { title: '操作', tdTemplate: this.departmentSelectedTpl, width: 100 }
      ]
    };
    this.getPurchasePlanAllotList();
  }

}
