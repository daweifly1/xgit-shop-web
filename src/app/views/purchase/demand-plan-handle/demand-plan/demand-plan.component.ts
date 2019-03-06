import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UfastTableNs } from '../../../../layout/ufast-table/ufast-table.component';
import { PurchaseService, PurchaseServiceNs } from '../../../../core/trans/purchase.service';
import { ActionCode } from '../../../../../environments/actionCode';
import { ShowMessageService } from '../../../../widget/show-message/show-message';

export interface TabPageType {
  demandListPage: number;
  demandDetailPage: number;
}
export interface ActionStatus {
  obsolete: boolean;
}

@Component({
  selector: 'app-demand-plan',
  templateUrl: './demand-plan.component.html',
  styleUrls: ['./demand-plan.component.scss']
})
export class DemandPlanComponent implements OnInit {
  @ViewChild('operationTpl') operationTpl: TemplateRef<any>;
  @ViewChild('showDetailTpl') showDetailTpl: TemplateRef<any>;
  public demandListTable: UfastTableNs.TableConfig;
  public tabPageType: TabPageType = {
    demandListPage: 0,
    demandDetailPage: 1
  };
  public selectedPage = 0;
  // public filters = {
  //   demandId: '',
  //   status: null
  // };
  public filters: any;
  public demandList: PurchaseServiceNs.DemandListData[] = [];
  public auditStatusList = [
    { value: 1, name: '已接受' },
    { value: 2, name: '已作废' },
  ];
  public ActionCode = ActionCode;
  public actionStatus: { [demandId: string]: ActionStatus } = {};
  public currIndexId = '';
  public demandDataMap = this.purchaseService.demandDataMap;
  public isShowAdvancedSearch = false;


  constructor(private purchaseService: PurchaseService,
    private messageService: ShowMessageService) {
    this.filters = {};
  }
  public getDemandList = () => {
    const filters = {
      applyNo: this.filters.demandId,
      status: this.filters.status
    };
    const paramsData = {
      filters: filters,
      pageNum: this.demandListTable.pageNum,
      pageSize: this.demandListTable.pageSize
    };
    this.demandList = [];
    this.demandListTable.loading = true;
    this.purchaseService.getDemandPlanList(paramsData).then((resData) => {
      this.demandList = [];
      this.demandListTable.loading = false;
      if (resData.code !== 0) {
        this.messageService.showAlertMessage('', resData.message, 'error');
        return;
      }
      this.demandListTable.total = resData.value.total;
      resData.value.list.forEach((item) => {
        this.demandList.push({
          id: item[this.demandDataMap.id.key],
          orgName: item[this.demandDataMap.orgName.key],
          demandId: item[this.demandDataMap.demandId.key],
          applyDate: item[this.demandDataMap.applyDate.key],
          applyDepartment: item[this.demandDataMap.applyDepartment.key],
          applicant: item[this.demandDataMap.applicant.key],
          status: item[this.demandDataMap.status.key],
          remark: item[this.demandDataMap.remark.key],
          applyType: item[this.demandDataMap.applyType.key],
          urgencyFlag: item[this.demandDataMap.urgencyFlag.key]
        });
        this.actionStatus[item[this.demandDataMap.demandId.key]] = {
          obsolete: item[this.demandDataMap.status.key] !== PurchaseServiceNs.DemandPlanStatus.HasObsoleted
        };
      });
    }, (error) => {
      this.demandListTable.loading = false;
      this.messageService.showAlertMessage('', error.message, 'error');
    });

  }
  public advancedSearch() {
    this.isShowAdvancedSearch = !this.isShowAdvancedSearch;
  }
  public advancedSearchReset() {
    this.filters = {};
    this.getDemandList();
  }
  public advancedSearchClose() {
    this.isShowAdvancedSearch = false;
  }
  public showDemandDetail(id) {
    this.currIndexId = id;
    this.selectedPage = this.tabPageType.demandDetailPage;
  }
  public obsoleteDemandPlan(id) {
    const paramsData = [id];
    this.messageService.showAlertMessage('', '是否作废该需求计划', 'confirm').afterClose
      .subscribe((type: string) => {
        if (type !== 'onOk') {
          return;
        }
        this.purchaseService.cancelDemandPlan(paramsData).then((resData) => {
          if (resData.code !== 0) {
            this.messageService.showAlertMessage('', resData.message, 'error');
            return;
          }
          this.messageService.showToastMessage('操作成功', 'success');
          this.getDemandList();
        }, (error) => {
          this.messageService.showAlertMessage('', error.message, 'error');
        });
      });
  }
  public onChildEmit(refresh) {
    this.selectedPage = this.tabPageType.demandListPage;
    if (refresh) {
      this.getDemandList();
    }
  }
  ngOnInit() {
    this.demandListTable = {
      id: 'purchase-demand-plan',
      showCheckbox: false,
      pageSize: 10,
      showPagination: true,
      pageSizeOptions: [10, 20, 30, 40, 50],
      pageNum: 1,
      total: 0,
      loading: false,
      splitPage: true,
      headers: [
        {
          title: '操作',
          tdTemplate: this.operationTpl,
          width: 50
        },
        {
          title: '业务实体',
          field: 'orgName',
          width: 100
        },
        {
          title: '需求申请单号',
          tdTemplate: this.showDetailTpl,
          width: 110
        },
        {
          title: '申请日期',
          field: 'applyDate',
          pipe: 'date:yyyy-MM-dd',
          width: 100
        },
        {
          title: '申请部门',
          field: 'applyDepartment',
          width: 100
        },
        {
          title: '申请人',
          field: 'applicant',
          width: 100
        },
        {
          title: '需求申请类型',
          field: 'applyType',
          pipe: 'demandApplyType',
          width: 110
        },
        {
          title: '是否紧急',
          field: 'urgencyFlag',
          pipe: 'demandUrgencyFlag',
          width: 100
        },
        {
          title: '状态',
          field: 'status',
          pipe: 'demandPlanStatus',
          width: 100
        },
        {
          title: '备注',
          field: 'remark',
          width: 100
        },
      ]
    };
    this.getDemandList();
  }

}
