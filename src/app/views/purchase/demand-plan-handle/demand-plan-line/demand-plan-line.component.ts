import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { PurchaseServiceNs, PurchaseService } from '../../../../core/trans/purchase.service';
import { ShowMessageService } from '../../../../widget/show-message/show-message';
import { UserService } from '../../../../core/common-services/user.service';
import { UfastUtilService } from '../../../../core/infra/ufast-util.service';
import { ActionCode } from '../../../../../environments/actionCode';

export interface TabPageType {
  DemandLineListPage: number;
  CreatePurchasePlanPage: number;
}
@Component({
  selector: 'app-demand-plan-line',
  templateUrl: './demand-plan-line.component.html',
  styleUrls: ['./demand-plan-line.component.scss']
})
export class DemandPlanLineComponent implements OnInit {
  @ViewChild('plannerSelectedTpl') plannerSelectedTpl: TemplateRef<any>;
  public selectedTab = 0;
  public tabPageType: TabPageType = {
    DemandLineListPage: 0,
    CreatePurchasePlanPage: 1
  };
  public isShowAdvancedSearch = false;
  public filters = {
    demandId: '',
    lineType: null,
    applyDepartment: '',
    applicant: '',
    applyStartDate: '',
    applyEndDate: '',
    planner: '',
    isHasPlanner: null,
    handleStatus: 0
  };
  public demandLineTableConfig: UfastTableNs.TableConfig;
  public demandLineList: PurchaseServiceNs.DemandPlanLineData[] = [];
  private demandLineOriginList = [];
  public demandDataMap = this.purchaseService.demandDataMap;
  public lineTypList = [
    { value: 1, name: '材料' },
    { value: 2, name: '备件' },
  ];
  public isHasPlannerList = [
    { value: 1, name: '有' },
    { value: 0, name: '否' }
  ];
  public handleStatusList = [
    { value: 0, name: '待处理' },
    { value: 1, name: '已处理' },
    { value: 2, name: '已作废' },
  ];
  public tabList = ['全部', '材料', '备件'];

  public isShowPlannerListModal = false;
  public plannerListTableConfig: UfastTableNs.TableConfig;
  public plannerList: { name: string; userId: string }[] = [];
  public selectedTabIndex = 0;
  private selectedLineIds = [];
  public createdPurchasePlan = [];
  public actionCode = ActionCode;

  constructor(private purchaseService: PurchaseService,
    private userService: UserService,
    private messageService: ShowMessageService,
    private utilService: UfastUtilService) { }
  public getDemandLineList = () => {
    const filtersData = {
      applyNo: this.filters.demandId.trim(),
      materialsType: this.filters.lineType,
      applyDepartment: this.filters.applyDepartment.trim(),
      applicant: this.filters.applicant.trim(),
      beginDate: this.filters.applyStartDate ? this.utilService.getStartDate(this.filters.applyStartDate) : '',
      endDate: this.filters.applyEndDate ? this.utilService.getEndDate(this.filters.applyEndDate) : '',
      planner: this.filters.planner.trim(),
      planner_flag: this.filters.isHasPlanner,
      handleStatus: this.filters.handleStatus
    };
    const paramsData = {
      filters: filtersData,
      pageNum: this.demandLineTableConfig.pageNum,
      pageSize: this.demandLineTableConfig.pageSize
    };
    this.demandLineTableConfig.loading = true;
    this.demandLineTableConfig.checkAll = false;
    this.demandLineList = [];
    this.purchaseService.getDemandPlanLineList(paramsData).then((resData) => {
      this.demandLineList = [];
      this.demandLineTableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      if (!resData.value) {
        return;
      }
      this.demandLineTableConfig.total = resData.value ? resData.value.total : 0;
      this.demandLineOriginList = resData.value.list || [];
      resData.value.list.forEach((item) => {
        item.isChecked = false;
        this.demandLineList.push({
          id: item[this.demandDataMap.id.key],
          lineNo: item[this.demandDataMap.lineNo.key],
          planner: item[this.demandDataMap.planner.key],
          applyDate: item[this.demandDataMap.applyDate.key],
          demandId: item[this.demandDataMap.demandId.key],
          demandPlanLineNo: item[this.demandDataMap.demandPlanLineNo.key],
          demandDepartment: item[this.demandDataMap.demandDepartment.key],
          lineType: item[this.demandDataMap.lineType.key],
          materialCode: item[this.demandDataMap.materialCode.key],
          materialDescription: item[this.demandDataMap.materialDescription.key],
          unit: item[this.demandDataMap.unit.key],
          quantity: item[this.demandDataMap.quantity.key],
          demandDate: item[this.demandDataMap.demandDate.key],
          targetPrice: item[this.demandDataMap.targetPrice.key],
          lineTotalAmount: item[this.demandDataMap.lineTotalAmount.key],
          handleDate: item[this.demandDataMap.handleDate.key],
          handleStatus: item[this.demandDataMap.handleStatus.key],
          applyType: item[this.demandDataMap.applyType.key],
          urgencyFlag: item[this.demandDataMap.urgencyFlag.key],
          isChecked: false
        });
      });
    }, (error) => {
      this.demandLineTableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public advancedSearch() {
    this.isShowAdvancedSearch = !this.isShowAdvancedSearch;
  }
  public advancedSearchReset() {
    Object.keys(this.filters).forEach((item) => {
      if (item === 'lineType') {
        this.filters.lineType = this.selectedTabIndex === 0 ? '' : this.selectedTabIndex;
        return;
      }
      this.filters[item] = '';
    });
    this.getDemandLineList();
  }
  public advancedSearchClose() {
    this.isShowAdvancedSearch = false;
  }
  public handleTabChange(ev) {
    this.advancedSearchReset();
    this.getDemandLineList();
    this.selectedTabIndex = ev.index;
  }
  public disabledStart = (startDate: Date) => {
    if (!startDate || !this.filters.applyEndDate) {
      return false;
    }
    return startDate.getTime() > new Date(this.filters.applyEndDate).getTime();
  }
  public disabledEnd = (endDate: Date) => {
    if (!endDate || !this.filters.applyStartDate) {
      return false;
    }
    return endDate.getTime() < new Date(this.filters.applyStartDate).getTime();
  }
  public createPurchasePlan() {
    const selectedItemList = this.demandLineList.filter((item) => item.isChecked);
    console.log(selectedItemList);
    if (selectedItemList.length === 0) {
      this.messageService.showToastMessage('请勾选要生成的需求计划', 'warning');
      return;
    }
    const departmentList = [];
    const lineTypeList = [];
    const plannerList = [];
    let isHasMaterialError = false;
    let isHasQuantityError = false;
    selectedItemList.forEach((item) => {
      if (!item.materialCode) {
        isHasMaterialError = true;
        return;
      }
      if (!(item.quantity === 0 || !!item.quantity)) {
        isHasQuantityError = true;
        return;
      }
      departmentList.push(item.demandDepartment);
      lineTypeList.push(item.lineType);
      plannerList.push(item.planner);
    });
    if (isHasMaterialError) {
      this.messageService.showToastMessage('物料编码不能为空，请选择有效的物料', 'warning');
      return;
    }
    if (isHasQuantityError) {
      this.messageService.showToastMessage('数量不能为空', 'warning');
      return;
    }
    const isDepartmentDiff = this.isArrayDiff(departmentList);
    const isLineTypeDiff = this.isArrayDiff(lineTypeList);
    const isPlannerDiff = this.isArrayDiff(plannerList);
    if (isDepartmentDiff) {
      this.messageService.showToastMessage('请选择相同的需求部门', 'warning');
      return;
    }
    if (isLineTypeDiff) {
      this.messageService.showToastMessage('请选择相同的物料类型', 'warning');
      return;
    }
    if (isPlannerDiff) {
      this.messageService.showToastMessage('请选择相同的计划员', 'warning');
      return;
    }
    this.submitPurchasePlan(selectedItemList);
  }
  private submitPurchasePlan(list) {
    const filters = [];
    list.forEach((item) => {
      const selectedItem = this.demandLineOriginList.find((listItem) => listItem.id === item.id);
      filters.push(selectedItem);
    });
    this.purchaseService.createPurchasePlanList(filters).subscribe((resData) => {
      if (resData.code !== 0) {
        this.messageService.showToastMessage(resData.message, 'error');
        return;
      }
      this.createdPurchasePlan = resData.value;
      this.selectedTab = this.tabPageType.CreatePurchasePlanPage;
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  private isArrayDiff(arr) {
    if (arr.length === 0) {
      return false;
    }
    return arr.some((item) => {
      return item !== arr[0];
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
      this.plannerList = [];
      this.plannerListTableConfig.loading = false;
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
  public isAllChoose(isAllChoose: boolean): void {
    for (let i = 0, len = this.demandLineList.length; i < len; i++) {
      this.demandLineList[i][this.demandLineTableConfig.checkRowField] = isAllChoose;
    }
  }

  public changeSelect(value: UfastTableNs.SelectedChange) {
    if (value.index === -1) {
      this.demandLineTableConfig.checkAll ? this.isAllChoose(true) : this.isAllChoose(false);
    } else {
      this.demandLineTableConfig.checkAll = this.demandLineList.every((item) => {
        return item.isChecked === true;
      });
    }
  }
  public openModifyPlannerModal() {
    let isHasItemChecked = false;
    this.selectedLineIds = [];
    this.demandLineList.forEach((item) => {
      if (!item.isChecked) {
        return;
      }
      isHasItemChecked = true;
      this.selectedLineIds.push(item.id);
    });
    if (!isHasItemChecked) {
      this.messageService.showToastMessage('请勾选要修改的行', 'warning');
      return;
    }
    this.isShowPlannerListModal = true;
  }
  public selectPlanner(id, name) {
    const paramsData = {
      ids: this.selectedLineIds,
      planner: name,
      plannerId: id
    };
    this.purchaseService.modifyPlanner(paramsData).then((resData) => {
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.messageService.showToastMessage('修改成功', 'success');
      this.isShowPlannerListModal = false;
      this.getDemandLineList();
    }, (error) => {
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public onChildEmit(refresh) {
    this.selectedTab = this.tabPageType.DemandLineListPage;
    if (refresh) {
      this.getDemandLineList();
    }
  }

  ngOnInit() {
    this.demandLineTableConfig = {
      id: 'purchase-demand-line',
      pageSize: 10,
      showCheckbox: true,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      checkRowField: 'isChecked',
      checkAll: false,
      splitPage: true,
      headers: [
        { title: '行号', field: 'lineNo', width: 80 },
        { title: '计划员', field: 'planner', width: 100 },
        { title: '申请日期', field: 'applyDate', pipe: 'date:yyyy-MM-dd', width: 100 },
        { title: '需求计划编号', field: 'demandId', width: 140 },
        { title: '需求部门', field: 'demandDepartment', width: 100 },
        { title: '物料类型', field: 'lineType', pipe: 'materialType2', width: 100 },
        { title: '物料编码', field: 'materialCode', width: 100 },
        { title: '物料描述', field: 'materialDescription', width: 110 },
        { title: '单位', field: 'unit', width: 100 },
        { title: '数量', field: 'quantity', width: 100 },
        { title: '需求日期', field: 'demandDate', pipe: 'date:yyyy-MM-dd', width: 100 },
        { title: '计划价', field: 'targetPrice', width: 100 },
        { title: '行总金额', field: 'lineTotalAmount', width: 100 },
        { title: '需求申请类型', field: 'applyType', pipe: 'demandApplyType', width: 110 },
        { title: '是否紧急', field: 'urgencyFlag', pipe: 'demandUrgencyFlag', width: 100 },
        { title: '状态', field: 'handleStatus', pipe: 'demandHandleStatus', width: 100 },
        { title: '处理时间', field: 'handleDate', pipe: 'date:yyyy-MM-dd', width: 100 }
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
      headers: [{ title: '用户名', field: 'name', width: 100, },
      { title: '用户ID', field: 'userId', width: 140, },
      { title: '操作', tdTemplate: this.plannerSelectedTpl, width: 100 }
      ]
    };
    this.getPlannerList();
    this.getDemandLineList();
  }

}
