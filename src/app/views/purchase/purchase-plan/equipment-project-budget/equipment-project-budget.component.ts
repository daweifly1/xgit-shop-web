import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActionCode} from '../../../../../environments/actionCode';
import {PurchaseService, PurchaseServiceNs} from '../../../../core/trans/purchase.service';
import {UfastTableNs} from '../../../../layout/ufast-table/ufast-table.component';
import {ShowMessageService} from '../../../../widget/show-message/show-message';

export interface TabPageType {
  ProjectListPage: number;
  AddOrEditProjectPage: number;
  ProjectDetailPage: number;
}
export interface ActionStatus {
  edit: boolean;
  audit: boolean;
  modify: boolean;
}

@Component({
  selector: 'app-equipment-project-budget',
  templateUrl: './equipment-project-budget.component.html',
  styleUrls: ['./equipment-project-budget.component.scss']
})
export class EquipmentProjectBudgetComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public tabPageType: TabPageType = {
    ProjectListPage: 0,
    AddOrEditProjectPage: 1,
    ProjectDetailPage: 2
  };
  public selectedTab = 0;
  public tableConfig: UfastTableNs.TableConfig;
  public isAdvancedSearchShow = false;
  public filters = {
    projectNo: '',
    projectName: '',
    belongYear: '',
    status: '',
    quotaStatus: ''
  };
  public actionStatus: {[index: string]: ActionStatus} = {};
  public equipmentProjectBudgetList: PurchaseServiceNs.EquipmentProjectBudgetData[] = [];
  public budgetListMap = this.purchaseService.budgetDataMap;
  public statusList = [
    {status: 0, label: '新建'},
    {status: 1, label: '待审核'},
    {status: 2, label: '审核通过'},
    {status: 3, label: '审核拒绝'},
    {status: 10, label: '完结'},
  ];
  public quotaStatusList = [
    {status: 0, label: '初始'},
    {status: 1, label: '待审核'},
    {status: 2, label: '审核通过'},
    {status: 3, label: '审核拒绝'}
  ];
  public currProjectId = '';
  public detailOperation = 'show';
  ActionCode = ActionCode;
  constructor(private purchaseService: PurchaseService,
              private messageService: ShowMessageService) {
  }
  public getEquipmentProjectBudgetList = () => {
    const paramsData = {
      filters: this.filters,
      pageSize: this.tableConfig.pageSize,
      pageNum: this.tableConfig.pageNum
    };
    this.tableConfig.loading = true;
    this.purchaseService.getPurchaseBudgetList(paramsData).then((resData) => {
      this.equipmentProjectBudgetList = [];
      this.tableConfig.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      resData.value.list.forEach((item) => {
        this.equipmentProjectBudgetList.push({
          id: item[this.budgetListMap.id.key],
          projectName: item[this.budgetListMap.projectName.key],
          projectCode: item[this.budgetListMap.projectCode.key],
          projectType: item[this.budgetListMap.projectType.key],
          orgName: item[this.budgetListMap.orgName.key],
          beginYear: item[this.budgetListMap.beginYear.key],
          belongYear: item[this.budgetListMap.belongYear.key],
          availableInvest: item[this.budgetListMap.availableInvest.key],
          totalInvest: item[this.budgetListMap.totalInvest.key],
          status: item[this.budgetListMap.status.key],
          quotaStatus: item[this.budgetListMap.quotaStatus.key],
          managerDepartment: item[this.budgetListMap.managerDepartment.key],
        });
        this.tableConfig.total = resData.value.total || 0;
        this.actionStatus[item[this.budgetListMap.id.key]] = {
          edit: (item[this.budgetListMap.status.key] === PurchaseServiceNs.ProjectStatus.NewBudget) ||
              (item[this.budgetListMap.status.key] === PurchaseServiceNs.ProjectStatus.RefuseAudit),
          audit: (item[this.budgetListMap.quotaStatus.key] === PurchaseServiceNs.ProjectQuotaStatus.WaitingForAudit) ||
              (item[this.budgetListMap.status.key] === PurchaseServiceNs.ProjectStatus.WaitForAudit),
          modify: (item[this.budgetListMap.status.key] === PurchaseServiceNs.ProjectStatus.AgreeAudit) &&
              (item[this.budgetListMap.quotaStatus.key] !== PurchaseServiceNs.ProjectQuotaStatus.WaitingForAudit),
        };
      });
    }, (error: any) => {
      this.tableConfig.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });
  }
  public advancedSearchClose() {
    this.isAdvancedSearchShow = false;
  }
  public advancedSearch() {
    this.isAdvancedSearchShow = !this.isAdvancedSearchShow;
  }
  public advancedSearchReset() {
    Object.keys(this.filters).forEach((item: string) => {
      this.filters[item] = '';
    });
    this.getEquipmentProjectBudgetList();
  }
  public showEquipmentProjectBudgetEditTab(operation, projectId) {
    this.currProjectId = projectId || '';
    this.selectedTab = this.tabPageType.AddOrEditProjectPage;
  }
  public showEquipmentProjectBudgetDetailTab(operation, projectId) {
    this.currProjectId = projectId || '';
    this.detailOperation = operation || 'show';
    this.selectedTab = this.tabPageType.ProjectDetailPage;
  }
  public onChildEmit(refresh) {
    if (refresh) {
      this.getEquipmentProjectBudgetList();
    }
    this.selectedTab = this.tabPageType.ProjectListPage;
  }

  ngOnInit() {
    this.tableConfig = {
      id: 'purchase-equipment',
      pageSize: 10,
      showCheckbox: false,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [{
        title: '操作',
        tdTemplate: this.operationTpl,
        width: 140,
      }, {
        title: '业务实体',
        field: 'orgName',
        width: 100,
      }, {
        title: '项目编码',
        field: 'projectCode',
        width: 100,
      }, {
        title: '项目名称',
        tdTemplate: this.showDetailTpl,
        width: 140
      }, {
        title: '起始年份',
        field: 'beginYear',
        width: 100,
      }, {
        title: '所属年份',
        field: 'belongYear',
        width: 100,
      }, {
        title: '项目总投资(万)',
        field: 'totalInvest',
        width: 120,
      }, {
        title: '当年可用投资(万)',
        field: 'availableInvest',
        width: 130,
      }, {
        title: '项目经理部',
        field: 'managerDepartment',
        width: 100,
      }, {
        title: '项目类别',
        field: 'projectType',
        width: 100,
      }, {
        title: '状态',
        field: 'status',
        width: 100,
        pipe: 'projectBudgetStatus'
      }, {
        title: '额度状态',
        field: 'quotaStatus',
        width: 100,
        pipe: 'projectBudgetQuotaStatus'
      }
      ]
    };
    this.getEquipmentProjectBudgetList();
  }

}
